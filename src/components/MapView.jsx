import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BENGALURU_CENTER = [12.9716, 77.5946];

// ── Smooth gradient heatmap ──────────────────────────────────────────────────
function HeatmapLayer({ areas }) {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!areas || areas.length === 0) return;

    import('leaflet.heat').then(() => {
      const maxTotal = Math.max(...areas.map(a => a.filteredTotal));
      const points = [];
      areas.forEach(area => {
        const baseWeight = area.filteredTotal;
        points.push([area.lat, area.lng, baseWeight * 1.5]);
        // Surrounding halo points for smooth merged heat blobs
        const rings = [
          { r: 0.005, count: 6, wMult: 0.7 },
          { r: 0.012, count: 10, wMult: 0.4 },
        ];
        rings.forEach(({ r, count, wMult }) => {
          for (let i = 0; i < count; i++) {
            const angle = (2 * Math.PI * i) / count;
            points.push([
              area.lat + r * Math.cos(angle),
              area.lng + r * Math.sin(angle),
              baseWeight * wMult,
            ]);
          }
        });
      });

      if (heatRef.current) map.removeLayer(heatRef.current);
      heatRef.current = L.heatLayer(points, {
        radius: 70,
        blur: 55,
        maxZoom: 15,
        max: maxTotal * 1.8,
        gradient: {
          0.0: 'rgba(255,0,0,0)',
          0.3: 'rgba(255,0,0,0.85)',
          0.5: '#ff2200',
          0.7: '#ff7700',
          0.85: '#ffcc00',
          1.0: '#ffffff',
        },
      }).addTo(map);
    });

    return () => { if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null; } };
  }, [areas, map]);

  return null;
}

// ── Zoom-to-area + highlight on click ───────────────────────────────────────
function ZoomController({ selectedArea }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedArea) return;
    map.flyTo([selectedArea.lat, selectedArea.lng], 15, {
      animate: true,
      duration: 1.0,
    });
  }, [selectedArea, map]);
  return null;
}

// ── Area markers ─────────────────────────────────────────────────────────────
function WardMarkers({ areas, onAreaClick, selectedArea, layerMode }) {
  const map = useMap();
  const [zoom, setZoom] = React.useState(map.getZoom());

  useMapEvents({
    zoom: () => setZoom(map.getZoom()),
  });

  const maxTotal = useMemo(() => Math.max(...areas.map(a => a.filteredTotal), 1), [areas]);

  return areas.map(area => {
    const isSelected = selectedArea?.name === area.name;
    const ratio = area.filteredTotal / maxTotal;
    const baseRadius = 6 + ratio * 12;

    // Scale size exponentially with zoom so it pinpoints to actual map coords
    const scale = Math.pow(2, zoom - 11.5);
    const radius = baseRadius * Math.max(scale, 0.4); // Minimum scale to keep visible when zoomed far out

    // Colour based on risk level
    const riskColors = {
      'Very High': '#ff2233',
      'High': '#ff4400',
      'Medium-High': '#ff7700',
      'Medium': '#ffaa00',
      'Low-Medium': '#ffcc44',
    };
    const color = riskColors[area.risk_level] || '#ff2233';

    const size = isSelected ? (radius * 4.5) + 16 : radius * 4.5;
    const isHeatmapMode = layerMode === 'heatmap';
    
    // Creamy pinpoint gradient OR invisible interactive area for heatmap mode
    const markerHtml = isHeatmapMode
      ? `<div style="width: 100%; height: 100%; border-radius: 50%; cursor: pointer; ${isSelected ? `border: 2px solid rgba(255,255,255,0.9); box-shadow: 0 0 30px ${color};` : ''}"></div>`
      : `<div style="width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle, #ffffff 0%, #fff2e6 5%, ${color}e6 15%, ${color}60 35%, transparent 65%); ${isSelected ? `border: 2px solid rgba(255,255,255,0.9); box-shadow: 0 0 30px ${color};` : ''}"></div>`;

    const icon = L.divIcon({
      className: 'custom-gradient-marker',
      html: markerHtml,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });

    return (
      <Marker
        key={area.name}
        position={[area.lat, area.lng]}
        icon={icon}
        eventHandlers={{ click: (e) => {
          if (e.originalEvent) e.originalEvent.stopPropagation();
          onAreaClick(area);
        }}}
      >
        <Tooltip
          direction="top"
          offset={[0, -size / 2.5]}
          opacity={1}
        >
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            background: 'rgba(8,8,8,0.97)', border: '1px solid rgba(255,34,51,0.6)',
            padding: '5px 9px', color: '#e0e0e0', borderRadius: '2px', minWidth: '140px',
          }}>
            <div style={{ color, fontSize: '10px', letterSpacing: '1px', marginBottom: '2px' }}>
              ▲ {area.name.toUpperCase()}
            </div>
            <div style={{ color: '#ff2233', fontWeight: 700, fontSize: '13px' }}>
              {area.filteredTotal.toLocaleString()} <span style={{ color: '#888', fontSize: '10px', fontWeight: 400 }}>cases</span>
            </div>
            <div style={{ color: '#666', fontSize: '10px', marginTop: '2px' }}>
              Risk: <span style={{ color }}>{area.risk_level}</span>
            </div>
          </div>
        </Tooltip>
      </Marker>
    );
  });
}

// ── MapReady helper ──────────────────────────────────────────────────────────
function MapReadyHandler({ onMapReady, onAreaClick }) {
  const map = useMapEvents({
    click: () => {
      if (onAreaClick) onAreaClick(null);
    }
  });
  useEffect(() => { onMapReady && onMapReady(map); }, [map, onMapReady]);
  return null;
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function MapView({ areas, filters, onAreaClick, selectedArea, onMapReady }) {
  return (
    <MapContainer
      center={BENGALURU_CENTER}
      zoom={12}
      zoomControl={true}
      style={{ width: '100%', height: '100%' }}
      preferCanvas={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <MapReadyHandler onMapReady={onMapReady} onAreaClick={onAreaClick} />
      <ZoomController selectedArea={selectedArea} />
      {filters.layerMode === 'heatmap' && <HeatmapLayer areas={areas} />}
      <WardMarkers areas={areas} onAreaClick={onAreaClick} selectedArea={selectedArea} layerMode={filters.layerMode} />
    </MapContainer>
  );
}

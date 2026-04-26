import React, { useState, useMemo } from 'react';
import MapView from './components/MapView';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import CrimeModal from './components/CrimeModal';
import crimeData from './data/crimes.json';

const CRIME_TYPES = ['All', 'Theft & Pickpocketing', 'Assault / Hurt', 'Cybercrime', 'Cheating & Fraud',
  'Robbery', 'Burglary (Night)', 'Molestation', 'Motor Vehicle Theft', 'Narcotic Offences'];
const YEARS = [2025];

function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [filters, setFilters] = useState({
    crimeType: 'All',
    year: 2025,
    layerMode: 'heatmap',
  });
  const [mapRef, setMapRef] = useState(null);

  const filteredAreas = useMemo(() => {
    return crimeData.areas.map(area => {
      const filteredCrimes = area.crimes.filter(c =>
        (filters.crimeType === 'All' || c.type === filters.crimeType)
      );
      const filteredTotal = filteredCrimes.reduce((sum, c) => sum + c.count, 0);
      return { ...area, filteredCrimes, filteredTotal };
    });
  }, [filters]);

  const handleAreaClick = (area) => {
    setSelectedArea(area);
  };

  const handleCloseModal = () => {
    setSelectedArea(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg)' }}>
      <MapView
        areas={filteredAreas}
        filters={filters}
        onAreaClick={handleAreaClick}
        selectedArea={selectedArea}
        onMapReady={setMapRef}
      />

      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          crimeTypes={CRIME_TYPES}
          years={YEARS}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-[1000] pointer-events-none">
        <StatsBar areas={filteredAreas} filters={filters} />
      </div>

      {selectedArea && (
        <CrimeModal area={selectedArea} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default App;

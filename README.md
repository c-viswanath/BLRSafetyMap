# BLR Crime Map — Bengaluru Safety Intelligence

An interactive, real-time crime heatmap for Bengaluru built with React, Leaflet.js, and Recharts. Deployed for free on [Vercel](https://vercel.com) or GitHub Pages.

---

## Features

- 🗺️ **Interactive Heatmap** — Intensity-based crime density visualization using CartoDB Dark Matter tiles
- 📊 **Crime Breakdown Panel** — Click any area to see donut charts, bar graphs, and individual case records
- 🔍 **Filters** — Filter by crime type, year (2019–2023), and toggle between heatmap/choropleth modes
- 📈 **Live Stats Bar** — Total cases, most dangerous area, and most common crime type at a glance
- ⚡ **Futuristic UI** — Glassmorphism panels, scanline effects, and red accent terminal styling

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Map | Leaflet.js via react-leaflet |
| Heatmap | leaflet.heat |
| Charts | Recharts |
| Tiles | CartoDB Dark Matter (free, no API key) |
| Deployment | Vercel / GitHub Pages |

---

## 🚀 Deploy to Vercel (Free, Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: BLR Crime Map"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/blr-crime-map.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **"Add New Project"** and select your `blr-crime-map` repository.
3. Vite is auto-detected — keep defaults (Build: `npm run build`, Output: `dist`).
4. Click **"Deploy"** — your site will be live in ~60 seconds.

### Step 3: Automatic Updates
Every `git push` triggers an automatic redeploy on Vercel.

---

## 🔄 Updating Crime Data

### Prerequisites
```bash
pip install -r scripts/requirements.txt
```

### Annual Update Workflow

1. Download the latest NCRB "Crime in India" PDF from [ncrb.gov.in](https://ncrb.gov.in) and place it in `scripts/`.

2. Run the extraction script:
   ```bash
   # Fresh year:
   python scripts/extract_ncrb.py --pdf scripts/Crime_in_India_2024.pdf --year 2024

   # Merge with existing years (recommended):
   python scripts/extract_ncrb.py --pdf scripts/Crime_in_India_2024.pdf --year 2024 --merge
   ```

3. Commit and push — Vercel redeploys automatically:
   ```bash
   git add src/data/crimes.json
   git commit -m "Update crime data: 2024 NCRB"
   git push
   ```

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Data Sources

- **NCRB:** [ncrb.gov.in](https://ncrb.gov.in)
- **Map Tiles:** [CartoDB Dark Matter](https://carto.com/basemaps/) (free, no API key)

---

## License

MIT © 2024

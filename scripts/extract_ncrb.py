#!/usr/bin/env python3
"""
NCRB Crime Data Extractor for Bengaluru
========================================
This script extracts crime statistics from NCRB (National Crime Records Bureau)
annual PDF reports and converts them into the crimes.json format used by the
BLR Crime Map web application.

USAGE:
  1. Download the NCRB "Crime in India" report PDF from https://ncrb.gov.in/
  2. Place the PDF in the same directory as this script
  3. Run: python extract_ncrb.py --pdf "Crime_in_India_2023.pdf" --year 2023
  4. The script will update ../src/data/crimes.json

DEPENDENCIES:
  pip install -r requirements.txt
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    import pdfplumber
    import pandas as pd
except ImportError:
    print("ERROR: Missing dependencies. Run: pip install -r requirements.txt")
    sys.exit(1)

# ─── Configuration ─────────────────────────────────────────────────────────────

# Approximate coordinates for Bengaluru areas
AREA_COORDINATES = {
    "Shivajinagar": {"lat": 12.9850, "lng": 77.6010},
    "Whitefield":   {"lat": 12.9698, "lng": 77.7499},
    "Koramangala":  {"lat": 12.9279, "lng": 77.6271},
    "Hebbal":       {"lat": 13.0354, "lng": 77.5988},
    "Yelahanka":    {"lat": 13.1007, "lng": 77.5963},
    "Jayanagar":    {"lat": 12.9299, "lng": 77.5824},
    "BTM Layout":   {"lat": 12.9166, "lng": 77.6101},
    "Majestic":     {"lat": 12.9766, "lng": 77.5713},
    "Electronic City": {"lat": 12.8399, "lng": 77.6770},
    "HSR Layout":   {"lat": 12.9121, "lng": 77.6446},
}

# IPC section mapping for common crime types
IPC_MAP = {
    "Theft":           "379",
    "Assault":         "323",
    "Robbery":         "392",
    "Burglary":        "454",
    "Fraud":           "420",
    "Cybercrime":      "66D",
    "Murder":          "302",
    "Kidnapping":      "363",
    "Pickpocketing":   "379",
    "Eve-teasing":     "354A",
}

# ─── PDF Extraction ─────────────────────────────────────────────────────────────

def find_bengaluru_pages(pdf_path: str) -> list[int]:
    """Identify pages in the PDF that contain Bengaluru district data."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            if "Bengaluru" in text or "Bangalore" in text:
                pages.append(i)
    print(f"[INFO] Found Bengaluru data on {len(pages)} pages: {pages}")
    return pages

def extract_tables_from_pages(pdf_path: str, page_nums: list[int]) -> list[pd.DataFrame]:
    """Extract tabular data from specified PDF pages."""
    tables = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num in page_nums:
            page = pdf.pages[page_num]
            raw_tables = page.extract_tables()
            for raw in raw_tables:
                if raw and len(raw) > 1:
                    try:
                        df = pd.DataFrame(raw[1:], columns=raw[0])
                        # Clean column names
                        df.columns = [str(c).strip() for c in df.columns]
                        tables.append(df)
                        print(f"[INFO] Extracted table with {len(df)} rows from page {page_num+1}")
                    except Exception as e:
                        print(f"[WARN] Could not parse table on page {page_num+1}: {e}")
    return tables

def parse_crime_tables(tables: list[pd.DataFrame], year: int) -> dict:
    """
    Parse the extracted tables and map crime types to areas.

    This function provides scaffolding — you may need to adapt
    the column-name matching logic to match the actual NCRB PDF structure,
    which varies slightly between annual reports.
    """
    area_data = {}

    for df in tables:
        # Try to detect relevant columns
        cols_lower = [str(c).lower() for c in df.columns]

        # Look for district/area column
        area_col = None
        for i, col in enumerate(cols_lower):
            if "district" in col or "city" in col or "area" in col:
                area_col = df.columns[i]
                break

        if area_col is None:
            print("[WARN] Could not identify area column in table, skipping.")
            continue

        for _, row in df.iterrows():
            area_name_raw = str(row.get(area_col, "")).strip()

            # Match to known areas
            matched_area = None
            for known_area in AREA_COORDINATES.keys():
                if known_area.lower() in area_name_raw.lower():
                    matched_area = known_area
                    break

            if not matched_area:
                continue

            if matched_area not in area_data:
                area_data[matched_area] = {}

            # Try to extract crime counts from remaining numeric columns
            for col in df.columns:
                if col == area_col:
                    continue
                val = str(row.get(col, "")).strip()
                # Check if it's a number
                val_clean = re.sub(r"[,\s]", "", val)
                if val_clean.isdigit():
                    crime_type = str(col).strip().title()
                    if crime_type and crime_type != "Total":
                        existing = area_data[matched_area].get(crime_type, 0)
                        area_data[matched_area][crime_type] = existing + int(val_clean)

    return area_data

# ─── JSON Generation ─────────────────────────────────────────────────────────────

def build_crimes_json(area_data: dict, year: int) -> dict:
    """Convert parsed area data into the crimes.json schema."""
    areas = []

    for area_name, crime_counts in area_data.items():
        coords = AREA_COORDINATES.get(area_name, {"lat": 12.9716, "lng": 77.5946})
        crimes = [
            {
                "type": crime_type,
                "count": count,
                "ipc": IPC_MAP.get(crime_type, "N/A"),
                "year": year,
            }
            for crime_type, count in sorted(crime_counts.items(), key=lambda x: -x[1])
        ]
        total = sum(c["count"] for c in crimes)

        areas.append({
            "name": area_name,
            "lat": coords["lat"],
            "lng": coords["lng"],
            "total_crimes": total,
            "crimes": crimes,
            "records": [],  # Detailed records require FIR-level data not in NCRB PDFs
        })

    # Sort by total crimes descending
    areas.sort(key=lambda x: -x["total_crimes"])
    return {"areas": areas}

def load_existing_json(json_path: str) -> dict:
    """Load existing crimes.json to merge/update with new year data."""
    if os.path.exists(json_path):
        with open(json_path, "r") as f:
            return json.load(f)
    return {"areas": []}

def merge_yearly_data(existing: dict, new_data: dict, year: int) -> dict:
    """
    Merge new year data into existing JSON.
    For each area, adds the new year's crimes without removing prior years.
    """
    existing_map = {a["name"]: a for a in existing.get("areas", [])}

    for new_area in new_data.get("areas", []):
        name = new_area["name"]
        if name in existing_map:
            # Remove old entries for this year, then add new
            existing_map[name]["crimes"] = [
                c for c in existing_map[name].get("crimes", []) if c["year"] != year
            ] + new_area["crimes"]
            # Recalculate total
            existing_map[name]["total_crimes"] = sum(
                c["count"] for c in existing_map[name]["crimes"]
            )
        else:
            existing_map[name] = new_area

    return {"areas": list(existing_map.values())}

# ─── CLI ─────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Extract NCRB PDF crime data into crimes.json for BLR Crime Map"
    )
    parser.add_argument("--pdf", required=True, help="Path to the NCRB PDF file")
    parser.add_argument("--year", type=int, required=True, help="Report year (e.g., 2023)")
    parser.add_argument(
        "--output", default="../src/data/crimes.json",
        help="Output JSON path (default: ../src/data/crimes.json)"
    )
    parser.add_argument(
        "--merge", action="store_true",
        help="Merge with existing crimes.json instead of overwriting"
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        print(f"ERROR: PDF file not found: {pdf_path}")
        sys.exit(1)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Processing: {pdf_path} for year {args.year}")

    # Step 1: Find Bengaluru pages
    page_nums = find_bengaluru_pages(str(pdf_path))
    if not page_nums:
        print("ERROR: No Bengaluru data found in PDF. Check the PDF structure.")
        sys.exit(1)

    # Step 2: Extract tables
    tables = extract_tables_from_pages(str(pdf_path), page_nums)
    if not tables:
        print("ERROR: No tables extracted from the identified pages.")
        sys.exit(1)

    # Step 3: Parse crime data
    area_data = parse_crime_tables(tables, args.year)
    if not area_data:
        print("WARN: No matching area data found. The PDF table structure may differ.")
        print("      Inspect the extracted tables and adapt parse_crime_tables() accordingly.")
        sys.exit(1)

    # Step 4: Build JSON
    new_json = build_crimes_json(area_data, args.year)

    # Step 5: Merge or overwrite
    if args.merge:
        existing = load_existing_json(str(output_path))
        final_json = merge_yearly_data(existing, new_json, args.year)
        print(f"[INFO] Merged {args.year} data into existing crimes.json")
    else:
        final_json = new_json

    # Step 6: Write output
    with open(output_path, "w") as f:
        json.dump(final_json, f, indent=2)

    print(f"\n[SUCCESS] crimes.json updated at: {output_path}")
    print(f"          Areas processed: {len(final_json['areas'])}")
    print(f"          Total crime entries: {sum(len(a['crimes']) for a in final_json['areas'])}")
    print("\nNext steps:")
    print("  1. Commit the updated crimes.json: git add src/data/crimes.json && git commit -m 'Update crime data {year}'")
    print("  2. Push to GitHub: git push")
    print("  3. Vercel/GitHub Pages will automatically redeploy.")

if __name__ == "__main__":
    main()

"""Regenerates app/src/data/usPlaces.json from a US Census Bureau Gazetteer
Places file.

Usage:
    1. Download the national places file for the year you want, e.g.:
       https://www2.census.gov/geo/docs/maps-data/data/gazetteer/<YEAR>_Gazetteer/<YEAR>_Gaz_place_national.zip
       (linked from https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html)
    2. Unzip it next to this script (or update INPUT_FILE below).
    3. Run: python3 parse_gazetteer_places.py
    4. Copy the resulting us_places.json over app/src/data/usPlaces.json.

Output is compact [name, state, lat, lng] tuples (not {name, state, lat, lng}
objects) to keep the file smaller -- see CLAUDE.md's "Explore destinations"
section for why, and for how app/src/utils/distance.js consumes this shape.
"""

import csv
import json

INPUT_FILE = "2024_Gaz_place_national.txt"
OUTPUT_FILE = "us_places.json"

# Census place names always end with a describer derived from the LSAD
# column (e.g. "Apex town", "Abanda CDP"). Stripped for a cleaner display
# name. Longest-first so "city and borough" doesn't get partially matched by
# "borough". Built by inspecting every distinct LSAD code's example name in
# the 2024 file (excluding Puerto Rico, which uses different, Spanish-
# language descriptors not handled here) -- re-check this list if a future
# year's file includes place types not seen before.
SUFFIXES = [
    " city and borough",
    " metropolitan government",
    " consolidated government",
    " unified government",
    " metro township",
    " urban county",
    " city (balance)",
    " municipality",
    " corporation",
    " borough",
    " village",
    " CDP",
    " city",
    " town",
]


def strip_suffix(name):
    for suf in SUFFIXES:
        if name.endswith(suf):
            return name[: -len(suf)]
    return name


# 50 states + DC. Deliberately excludes Puerto Rico (PR appears in the
# national file) to match the rest of the app's US-only scope.
VALID_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
    "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
    "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
    "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
    "WV", "WI", "WY",
}

rows = []
seen = set()
# latin-1 rather than utf-8: the Census file has a handful of special
# characters (documented in the record layout) that aren't valid utf-8.
with open(INPUT_FILE, encoding="latin-1") as f:
    reader = csv.reader(f, delimiter="\t")
    next(reader)  # header row (note: its last column has trailing padding
    # spaces in the raw file, which is why this reads by column index below
    # rather than by DictReader keyed on header names)
    for cols in reader:
        usps = cols[0].strip()
        if usps not in VALID_STATES:
            continue
        name = strip_suffix(cols[3].strip())
        key = (name.lower(), usps)
        if key in seen:  # a small number of exact name+state dupes exist
            continue
        seen.add(key)
        lat = round(float(cols[10]), 4)  # 4 decimals: ~11m precision, far
        lng = round(float(cols[11]), 4)  # more than this app's 250-mile
        rows.append([name, usps, lat, lng])  # local/flight threshold needs

rows.sort(key=lambda r: (r[1], r[0]))  # state, then name -- preparePlaces()
# in distance.js re-sorts by name at load time for fast prefix search; this
# order is just for a stable, readable diff if the file is regenerated.

with open(OUTPUT_FILE, "w") as f:
    json.dump(rows, f, separators=(",", ":"))

print(f"Total places: {len(rows)}")
print("Sample:", rows[:3])

apex = [r for r in rows if r[0] == "Apex" and r[1] == "NC"]
print("Apex, NC sanity check:", apex)

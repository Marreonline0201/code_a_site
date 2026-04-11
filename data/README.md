Place the combined NYC lead-testing CSV here by default:

`data/nyc-lead-testing.csv`

This file is built from:

- `data/Lead_At_The_Tap_Results.csv`
- `data/lead_testing.csv`

Duplicate rows are matched on `Kit ID + Zipcode`. When a row exists in both files,
the `lead_testing.csv` values win for shared fields and the older export keeps the
flush measurements that only it provides.

The ZIP/year trend source used alongside that dataset is:

`data/lead-testing2.csv`

Optional local enrichment files used by the legacy nearest-sample geocode flow:

- `data/nyc-water-samples.geocoded.json`
- `data/nyc-water-samples.geocoded.overrides.json`
- `data/nyc-water-samples.geocoded.misses.json`
- `data/nyc-zip-centroids.json`

You can also point the backend at a different local file with:

`NYC_WATER_SAMPLES_CSV_PATH=path/to/your-file.csv`

The checked-in geocode JSON is a preprocessing artifact. The API does not geocode
sample locations at request time. To regenerate it, run:

`npm run water:geocode`

NYC-only geocoder knobs (optional):

- `NYC_WATER_GEOCODER_DELAY_MS` (default `1100`)
- `NYC_WATER_GEOCODER_MAX_REQUESTS` (for batch/resume runs)
- `NYC_WATER_GEOCODER_CHECKPOINT_INTERVAL` (default `50` requests)
- `NYC_WATER_GEOCODER_PROGRESS_INTERVAL` (default `25` rows)
- `NYC_WATER_GEOCODER_USER_AGENT` (recommended for Nominatim etiquette)

Example batch run:

`$env:NYC_WATER_GEOCODER_MAX_REQUESTS=500; npm run water:geocode`

Expected source columns (active lead dataset):

- `Kit ID`
- `Borough`
- `Zipcode`
- `Date Collected`
- `Date Recieved`
- `Lead First Draw (mg/L)`
- `Lead 1-2 Minute Flush (mg/L)`
- `Lead 5 Minute Flush (mg/L)`
- `Copper First Draw (mg/L)`
- `Copper 1-2 Minute Flush (mg/L)`
- `Copper 5 minute Flush (mg/L)`

ZIP trend source columns:

- `Zipcode`
- `YEAR`
- `*TOTAL SAMPS ZIP`
- `*TOTAL SAMPS W/LEAD`
- `*% SAMPS WITH LEAD`
- `AVG LEVEL FD`
- `AVG LEVEL SD`
- `*AVG ALL`
- `*HIGHEST DRAW`

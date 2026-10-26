# The Olfactory Carnival · v2.0

A Belle Époque perfume roulette hosted free on GitHub Pages. No build step or paid service required.

## Publish the new version

Upload **all files** in this folder to the root of your existing `olfactory-carnival` GitHub repository, replacing same-named files. `index.html` and `collection.json` must both be in the repository root. Commit changes. GitHub Pages redeploys automatically. Allow a minute, then hard-refresh the site.

## Data included

`collection.json` contains 67 distinct **physically owned** fragrances extracted from the `Collection` tab of `Fragrance_Master v90.xlsx` where Have/Don't Have is `*Have`. Seven `On order` / `*On order` records were deliberately excluded pending receipt. The user can add them to the Google Sheet when received. Original notes and personal impressions are retained. Samples, wishlists and research tabs are excluded.

## Connect a Google Sheet (free)

1. Upload `Olfactory_Carnival_Google_Sheets_Collection.csv` into Google Sheets (File > Import > Upload). Keep columns `House`, `Fragrance`, `Notes / Accords`, `My Impressions`. Add new fragrance rows there; all rows are eligible.
2. In the Google Sheet, choose **File > Share > Publish to web**, select the specific Collection sheet, choose **Comma-separated values (.csv)**, then **Publish**. The published sheet is public. Copy the **published CSV URL** (not the editing link).
3. Edit `config.json` in the GitHub repository using the pencil icon. Set `googleSheetCsvUrl` to the published CSV URL, preserving JSON quotes, then commit. Example: `{ "googleSheetCsvUrl": "https://docs.google.com/spreadsheets/d/e/EXAMPLE/pub?output=csv" }`.
4. Refresh the app. It reads the published sheet at load; use **The Ledger > Refresh Collection** to request updates. Google publication may be cached briefly.

The Ledger also allows pasting a CSV URL to test without editing GitHub, but that preview address is stored in the browser and may be cleared. The permanent `config.json` setting is preferable and survives browser clearing and switching devices. The included `collection.json` remains a fallback when the Google Sheet is unavailable.

## Notes

- The roulette chooses any row from the collection, without filters or sample inventory. The next spin avoids the immediate previous result when possible.
- Only the collection data is public; do not publish private information in the sheet.
- The app reads Google Sheets directly; no paid API or backend.
- The Google Sheet is the source of truth once connected. Updating the sheet does not require editing the app files.

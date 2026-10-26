# The Olfactory Carnival — v1.1.0

A mobile-first, Belle Époque fragrance roulette. No build step, database, or paid hosting required.

## Publish with GitHub Pages
1. Create a public repository named `olfactory-carnival` at https://github.com/new.
2. Upload **all six files** from this folder to the repository root (`index.html`, `style.css`, `app.js`, `starter.json`, `icon.svg`, `manifest.webmanifest`). You may also upload this README.
3. Commit changes.
4. Go to repository **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**. Choose **main** and **/(root)**, then **Save**.
6. After GitHub publishes it, open `https://YOUR-USERNAME.github.io/olfactory-carnival/`.
7. On Android Chrome, open the menu and select **Add to Home screen** or **Install app** if offered.

## How to use
- **Spin the Wheel** picks a random full bottle by default and displays its **name prominently in a theatrical reveal overlay** after the spin. Close the overlay to see the full result card.
- **Wild Card** favors non-favorites (not an algorithmic recommendation).
- Filter by **Family** and **Mood**, or include samples.
- **My Cabinet** lets you search, favorite, and add entries.
- **Settings** lets you import CSV, export a JSON backup, and restore it.

## Your data and privacy
The included list is only a small **starter selection**, not your complete fragrance database. It contains user-provided impressions in abbreviated form.
Manual additions and CSV imports are saved in **localStorage** in that browser on that device. They do **not** automatically sync across devices or update your GitHub repository. Clearing browser site data may erase local additions, so export a JSON backup periodically.
Anyone can view the starter data published to the public GitHub Pages site. Imported notes stay on the device unless you explicitly publish them.

## Import CSV
Export your master workbook's Collection tab as CSV, ideally with headers `House,Fragrance,Family,Mood,Kind,Notes`. Common variants such as Brand/Name/Type are also recognized. Import merges by House + Fragrance. If your workbook has different headers, adapt the CSV or ask for a custom import mapping.
This app does not parse XLSX directly.

## Notes
Google Fonts requires an internet connection; local fallback fonts are provided.
The wheel is decorative; the selection is uniformly random among the eligible fragrances.

## Updating an existing GitHub Pages installation
Upload the new files to the **same repository**, replacing the previous versions, and commit. GitHub Pages will republish automatically. You may need to refresh the site in Chrome. Locally added fragrances are stored in the same browser under the same site address and should remain available when code is updated, but back them up first in Settings.

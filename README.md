# aftercredits.

A personal anime archive for tracking what you have watched, what you are watching, and what you want to watch next. Search for a title, pick the matching cover, add a rating or date, and leave a private note for yourself.

## Features

- Create a local profile and sign in with a username and password.
- Search anime through the AniList GraphQL API. Results include titles, posters, year, format, episode count, and score where available.
- Search using English, romanized, native, and catalog synonym titles. Results depend on the names and aliases available in AniList.
- Track each title as **Watched**, **Watching**, or **Planned**.
- Add an optional rating from 1 to 10 in half-point increments, a date, and a personal note.
- Filter the archive by status and search within saved titles.
- See collection totals and review notes in the FAQ.
- Switch the interface between English, Ukrainian, and Russian. The selected interface language is remembered in the browser.
- Use the responsive layout, full-screen anime search, poster cards, and custom date picker on desktop or mobile.

## Run locally

This is a static web app and does not require a build step or package installation. Serve the project directory over HTTP (the app uses browser cryptography for account passwords):

```sh
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in a modern browser.

## Deploy to Netlify

The project can be deployed as a static site. In Netlify, connect the repository or upload the project directory and use the repository root as the publish directory. No build command is required. Keep `index.html`, `css/`, `src/`, and `assets/` together in the published directory.

Once deployed, anyone with the site URL can open it. The current app stores profiles, passwords, anime entries, notes, and the language preference in that visitor's browser `localStorage`. These records are not uploaded to Netlify or AniList, do not sync across browsers or devices, and are not shared between visitors. An account created on localhost will not automatically appear on the deployed domain. This client-side account flow is for separating local profiles on one browser; it is not server-backed authentication or a secure multi-device account system.

## Anime search and external services

Anime suggestions come from [AniList](https://anilist.co/) using its public GraphQL endpoint. Search requires an internet connection. The app applies a request timeout and shows a recoverable message if the service is unavailable or slow. Poster images are served from AniList's image CDN. The interface fonts (Manrope and IBM Plex Mono) are loaded from Google Fonts.

## Project structure

```text
.
├── assets/
│   └── favicon/          # Browser, mobile, and web app icons
├── css/
│   ├── main.css          # CSS entry point; imports the modules below
│   ├── tokens.css        # Theme variables and global defaults
│   ├── shell.css         # Sidebar, brand, navigation, and top bar
│   ├── collection.css    # Archive, statistics, filters, and anime cards
│   ├── dialogs.css       # Add-title form, notes, FAQ, and calendar dialogs
│   ├── auth.css          # Sign-in and account creation screens
│   ├── motion.css        # Animations and reduced-motion preferences
│   ├── responsive.css    # Collection layout breakpoints
│   └── search.css        # Full-screen search and selection panel
├── src/
│   └── js/
│       ├── anime-api.js  # AniList requests and result mapping
│       ├── app.js        # Events and application state coordination
│       ├── auth.js       # Local profile registration and sign-in
│       ├── collection.js # Anime entry operations, filters, and statistics
│       ├── i18n.js       # Interface translations and language preference
│       ├── storage.js    # Per-profile localStorage persistence
│       └── view.js       # Rendering and UI updates
├── index.html            # Application markup and script entry points
├── LICENSE               # MIT License
└── README.md
```

CSS is loaded through `css/main.css`. Keep its `@import` list in cascade order when adding or moving styles, since later modules can override earlier rules.

## Data and privacy

The app currently has no server-side database or synchronization. Clearing browser data can erase local profiles and archives. Passwords are stored as salted PBKDF2 hashes in `localStorage`, but because authentication is entirely client-side, it should not be treated as production security for sensitive data. Use a server-backed authentication and database service before relying on shared accounts or cross-device backups.

## License

This project is distributed under the MIT License. See [`LICENSE`](LICENSE).

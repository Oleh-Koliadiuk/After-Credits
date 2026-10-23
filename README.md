# aftercredits.

A personal anime archive for tracking what you have watched, what you are watching, and what you want to watch next. Search for a title, pick its cover, add a rating or date, and leave a note for yourself.

## Features

- Create an account and access the same profile from different devices.
- Update your username and profile avatar from the account page.
- Keep account credentials and anime collections on the API server instead of the browser.
- Search AniList for anime titles, posters, release year, format, episode count, and score.
- Search with English, romanized, native, and catalog synonym titles where available.
- Track titles as **Watched**, **Watching**, or **Planned**.
- Add an optional rating from 1 to 10 in half-point increments, a date, and a personal note.
- Filter the archive by status, search saved titles, and review collection statistics.
- Switch the interface between English, Ukrainian, and Russian; the language preference stays in the browser.
- Use the responsive layout, full-screen title search, FAQ, and custom date picker on desktop or mobile.

## Project structure

```text
.
├── assets/
│   └── favicon/                 # Browser, mobile, and web app icons
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── auth.py          # Registration, sign-in, sign-out, current profile
│   │   │   └── collection.py    # Anime collection API
│   │   ├── core/
│   │   │   ├── database.py      # SQLite/PostgreSQL connection and sessions
│   │   │   ├── security.py      # Password hashing and session tokens
│   │   │   └── rate_limit.py    # Per-IP API request limits and temporary blocks
│   │   ├── main.py              # FastAPI app, CORS, startup
│   │   ├── models.py            # User, session, and anime database models
│   │   ├── schemas.py           # Request validation
│   ├── data/                    # Local SQLite database (created on first run)
│   └── requirements.txt
├── css/
│   ├── main.css                 # CSS entry point and ordered imports
│   ├── tokens.css               # Theme and global defaults
│   ├── shell.css                # Sidebar, brand, navigation, top bar
│   ├── collection.css           # Archive, statistics, filters, cards
│   ├── dialogs.css              # Notes, FAQ, calendar, shared dialogs
│   ├── auth.css                 # Sign-in and account creation
│   ├── motion.css               # Animations and reduced-motion support
│   ├── responsive.css           # Collection layout breakpoints
│   ├── search.css               # Full-screen search and add form
│   └── profile.css              # Account profile and avatar controls
├── src/js/
│   ├── config.js                # Frontend API URL
│   ├── api.js                   # HTTP client and session token
│   ├── auth.js                  # Sign-in and one-time legacy account migration
│   ├── anime-api.js             # AniList title search and result mapping
│   ├── storage.js               # Collection API client
│   ├── collection.js            # Client-side collection operations and statistics
│   ├── i18n.js                  # Translations and saved language preference
│   ├── view.js                  # DOM rendering
│   └── app.js                   # UI events and application coordination
├── .editorconfig
├── .gitignore
├── index.html
├── LICENSE
└── README.md

```

## Run locally

Use two terminals. The first starts the API. The second serves the static frontend.

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

In another terminal, from the project root:

```sh
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). The API is available at [http://127.0.0.1:8001/api](http://127.0.0.1:8001/api), and its interactive endpoint documentation is at [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs).

The API creates `backend/data/aftercredits.db` on its first start. This SQLite database is intended for local development. The account page stores an optional email address, a resized JPEG avatar, and the join date with the user record. Existing databases are upgraded at API startup; the existing account with ID 2 is dated October 20, 2026.

## API overview

| Method   | Endpoint                 | Purpose                                       |
| -------- | ------------------------ | --------------------------------------------- |
| `POST`   | `/api/auth/register`     | Create an account and start a session         |
| `POST`   | `/api/auth/login`        | Sign in and start a session                   |
| `POST`   | `/api/auth/logout`       | Revoke the active session                     |
| `GET`    | `/api/auth/me`           | Return account profile and collection count   |
| `PATCH`  | `/api/auth/profile`      | Update username, email, and avatar            |
| `GET`    | `/api/collection`        | Load the current user's anime                 |
| `POST`   | `/api/collection`        | Add an anime                                  |
| `PATCH`  | `/api/collection/{id}`   | Update rating, date, status, or note          |
| `DELETE` | `/api/collection/{id}`   | Remove an anime                               |
| `POST`   | `/api/collection/import` | Import the previous browser-stored collection |

Collection routes require a bearer session token. Tokens are random, expire after 30 days by default, and are stored hashed in the database. The browser keeps the active token in `sessionStorage` for the current tab session.

The API applies per-process IP limits: 120 API requests per minute triggers a 10-minute block; sign-in and registration allow 10 requests per five minutes before a 15-minute block. Configure the environment variables documented in `backend/.env.example` to change these limits. This helps with basic scripted abuse and credential guessing, but it is not a complete DoS defense: the counters reset on restart and are not shared by multiple workers. Before public deployment, put the API behind a trusted reverse proxy or WAF with network-level protection and use a shared rate-limit store such as Redis across workers. Do not trust client-supplied `X-Forwarded-For` headers; configure proxy trust only for the actual hosting proxy.

## Deploying the frontend and API

Netlify can host the static frontend, but it does not run this FastAPI application. Deploy the `backend/` API separately and connect it to a persistent PostgreSQL database for a public deployment. Then:

1. Set the API's `DATABASE_URL` to the PostgreSQL connection string.
2. Set `ALLOWED_ORIGINS` to the exact Netlify site origin, such as `https://your-site.netlify.app` (comma-separate any additional allowed origins).
3. Set `window.AnimeTrackerConfig.apiBaseUrl` in `src/js/config.js` to the API's public HTTPS URL plus `/api`, unless the API is reverse-proxied at the frontend's `/api` path.
4. Redeploy the frontend after setting the API URL.

For local development, `config.js` automatically points localhost pages to `http://127.0.0.1:8001/api`. API requests use an `Authorization` header, and CORS is restricted to the origins listed in `ALLOWED_ORIGINS`.

The SQLite file is suitable for development only. A deployment needs a persistent database; do not rely on temporary container storage for user collections. Serve the API over HTTPS and keep database credentials out of frontend files and Git.

## Passwords, sessions, and existing local data

Passwords are never saved as readable text. The API hashes passwords with Argon2 before saving them. The browser receives a random session token; the server stores only its hash and revokes it on sign-out. The token is kept in `sessionStorage`, which is accessible to JavaScript running on the page, so the deployed frontend should remain free of untrusted scripts and should use HTTPS.

Existing browser-only accounts and collections can be moved when signing in with the same username and password on the new API. The app verifies the old password locally, imports that profile's entries, and removes the old local account data only after the import succeeds. The interface language remains stored locally in the browser.

## Anime search and external services

Suggestions come from the public AniList GraphQL API and require an internet connection. The app has an eight-second request timeout and displays a retry message if search fails. Poster images load from AniList. Fonts (Manrope and IBM Plex Mono) load from Google Fonts.

## License

This project is distributed under the MIT License. See [`LICENSE`](LICENSE).

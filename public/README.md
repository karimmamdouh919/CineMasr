# CineMisr — Frontend 1

This folder contains ONLY the Frontend 1 part of the CineMisr full-stack project.

## Included pages
- Home
- Movies
- Movie Details
- Search & Filter
- Cinema / Branch Selection
- Movie & Showtime Selection

## Technologies
- HTML
- CSS
- Vanilla JavaScript
- LocalStorage for temporary frontend booking state

## Run
1. Open the folder in VS Code.
2. Open `index.html`.
3. Recommended: use the VS Code Live Server extension and click **Go Live**.
4. Start from Home and test the full flow:
   Home → Movies/Details → Cinema → Movie & Showtime.

## Notes for team integration
This is frontend-only. There is no Node.js, Express, database, authentication, or backend code here.
The booking selections are kept in LocalStorage only so the UI can be tested before backend integration.
Later, the backend team can replace the local data/functions with API calls using `fetch()`.

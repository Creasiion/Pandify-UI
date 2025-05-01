# Pandify-UI

Pandify-UI is a full-stack music playlist web application that allows users to explore and manage curated playlists. It was built using a Vue.js frontend and an Express.js backend.

## Folder Structure

- `Frontend` — Vue.js frontend that powers the UI
- `Backend - Servers` — Express.js server handling backend logic

## Features

- Dynamic playlist creation, editing, and reordering
- Public/private playlist visibility controls
- User authentication with Auth0
- Simulated API-style data flow with mock/local data

## Tech Stack

- **Frontend:** Vue.js (Was previously React, but switched for simplicity), JavaScript, HTML, CSS
- **Backend:** Express.js, Node.js
- - **Auth:** Auth0 (user login/logout)
- **Database:** MongoDB (Mongoose)
- **Other:** Axios, npm

## Future Improvements
- Communicate with a music data API for content, not just built in mock data or user created data.
- Add in artist/album photos
- Add search, filtering, and music previews
- Add collaborative playlist sharing

# Telugu Movies Streaming App

A full-featured movie streaming application built with React, featuring 10 Telugu movies with complete CRUD operations.

## Features

- 🎬 Browse 10 Telugu movies with detailed information
- 🔍 Search and filter movies by genre
- 📝 Full CRUD operations (Create, Read, Update, Delete)
- 📌 Add movies to watchlist
- 🎨 Modern UI with Tailwind CSS
- 📱 Fully responsive design
- 🔔 Toast notifications for user feedback

## Tech Stack

- **React 18** - UI library
- **React Router DOM** - Navigation
- **Axios** - HTTP client
- **JSON-Server** - Backend API
- **Tailwind CSS** - Styling
- **React Icons** - Icons
- **React Toastify** - Notifications

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the JSON Server (in a separate terminal):
```bash
npm run server
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`
The JSON Server will run at `http://localhost:3001`

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── MovieCard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── MovieDetails.jsx
│   │   ├── Watchlist.jsx
│   │   ├── AddMovie.jsx
│   │   └── EditMovie.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── db.json
├── package.json
└── README.md
```

## API Endpoints

### Movies
- `GET /movies` - Get all movies
- `GET /movies/:id` - Get movie by ID
- `POST /movies` - Create new movie
- `PUT /movies/:id` - Update movie
- `DELETE /movies/:id` - Delete movie

### Watchlist
- `GET /watchlist` - Get all watchlist items
- `POST /watchlist` - Add to watchlist
- `DELETE /watchlist/:id` - Remove from watchlist

## Usage

1. **Browse Movies**: View all 10 Telugu movies on the home page
2. **Search**: Use the search bar to find movies by title, director, or synopsis
3. **Filter**: Filter movies by genre using the dropdown
4. **View Details**: Click on any movie card to see detailed information
5. **Add to Watchlist**: Click the bookmark icon to save movies
6. **Add Movie**: Use the "Add Movie" button to create new entries
7. **Edit Movie**: Click "Edit Movie" on any movie details page
8. **Delete Movie**: Remove movies using the delete button

## Movies Included

1. RRR (2022)
2. Baahubali 2: The Conclusion (2017)
3. Pushpa: The Rise (2021)
4. Ala Vaikunthapurramuloo (2020)
5. Sitaramam (2022)
6. KGF: Chapter 2 (2022)
7. Jersey (2019)
8. Maharshi (2019)
9. Fidaa (2017)
10. Eega (2012)

## Notes

- Make sure JSON Server is running before using the app
- The Rapid API key for IMDB is stored in the original `main.js` file (not used in this React implementation)
- All movie data is stored in `db.json` and managed by JSON Server


# Streamflix - Complete Code Explanation

## 📚 Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Configuration Files](#configuration-files)
4. [Entry Point (main.jsx)](#entry-point-mainjsx)
5. [Main App Component](#main-app-component)
6. [Context Providers](#context-providers)
7. [Pages](#pages)
8. [Components](#components)
9. [Services/API](#servicesapi)
10. [Utilities](#utilities)
11. [Styling](#styling)

---

## Project Overview

**Streamflix** is a modern movie streaming web application built with React.js that allows users to:
- Browse Telugu movies from a local database
- Search movies from IMDb API
- Add movies to watchlist
- View movie details and trailers
- Track viewing history
- Get personalized recommendations

**Tech Stack:**
- **Frontend Framework:** React 18.2.0 with Vite
- **Routing:** React Router DOM 6.20.0
- **Styling:** Tailwind CSS 3.3.6
- **HTTP Client:** Axios 1.6.2
- **Backend:** JSON-Server (mock REST API)
- **Icons:** React Icons 4.12.0
- **Notifications:** React Toastify 9.1.3

---

## Project Structure

```
FS/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # React Context providers
│   ├── pages/              # Page components (routes)
│   ├── services/           # API service files
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── db.json                 # JSON-Server database
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

---

## Configuration Files

### 1. `package.json`
**Purpose:** Defines project metadata, dependencies, and scripts

**Key Sections:**
- **dependencies:** Runtime libraries needed for the app
  - `react`, `react-dom`: Core React library
  - `react-router-dom`: Client-side routing
  - `axios`: HTTP requests
  - `react-icons`: Icon library
  - `react-toastify`: Toast notifications

- **devDependencies:** Development-only tools
  - `vite`: Fast build tool and dev server
  - `tailwindcss`: Utility-first CSS framework
  - `json-server`: Mock REST API server

- **scripts:**
  - `npm run dev`: Start development server
  - `npm run build`: Build for production
  - `npm run server`: Start JSON-Server on port 3001

### 2. `vite.config.js`
**Purpose:** Configures Vite build tool
- Sets up React plugin
- Defines build options

### 3. `tailwind.config.js`
**Purpose:** Tailwind CSS configuration
- Extends default theme
- Adds custom colors (primary color scheme)
- Configures content paths for purging unused CSS

### 4. `postcss.config.js`
**Purpose:** PostCSS configuration
- Processes CSS with Tailwind and Autoprefixer

### 5. `db.json`
**Purpose:** JSON-Server database file
- Contains all data: movies, users, watchlist
- Acts as a REST API endpoint
- Structure:
  ```json
  {
    "movies": [...],      // Movie data
    "users": [...],       // User accounts
    "watchlist": [...]    // User watchlists
  }
  ```

---

## Entry Point (main.jsx)

**File:** `src/main.jsx`

**What it does:**
This is the entry point of the React application. It's the first file that runs when the app loads.

**Code Breakdown:**

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
```
- Imports React and ReactDOM for rendering

```javascript
import App from './App.jsx'
import './index.css'
```
- Imports the main App component and global styles

```javascript
import { BrowserRouter } from 'react-router-dom'
```
- BrowserRouter enables client-side routing (URL changes without page reload)

```javascript
import { ToastContainer } from 'react-toastify'
```
- ToastContainer displays notification toasts throughout the app

```javascript
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SearchHistoryProvider } from './context/SearchHistoryContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'
```
- Imports all context providers that manage global state

**Provider Nesting:**
```javascript
<BrowserRouter>           // Enables routing
  <ThemeProvider>         // Manages dark/light theme
    <SearchHistoryProvider>    // Tracks search history
      <RecentlyViewedProvider> // Tracks viewed movies
        <AuthProvider>         // Manages user authentication
          <App />              // Main app component
        </AuthProvider>
      </RecentlyViewedProvider>
    </SearchHistoryProvider>
  </ThemeProvider>
</BrowserRouter>
```

**Why nested?** Each provider wraps the next, creating a hierarchy where inner components can access outer contexts.

**ToastContainer Configuration:**
- `position="top-right"`: Notifications appear top-right
- `autoClose={3000}`: Auto-close after 3 seconds
- `draggable`: Users can drag toasts
- `pauseOnHover`: Pause timer when hovering

---

## Main App Component

**File:** `src/App.jsx`

**What it does:**
Defines all routes and navigation structure for the application.

### ProtectedRoute Component
```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />
}
```
**Purpose:** Protects routes that require authentication
- Checks if user is logged in
- Shows loading spinner while checking
- Redirects to login if not authenticated
- Renders children (protected page) if authenticated

### Layout Component
```javascript
const Layout = ({ children }) => {
  const location = useLocation()
  const showNavbar = location.pathname !== '/login' && location.pathname !== '/signup'
  
  return (
    <>
      <ScrollProgress />
      {showNavbar && <Navbar />}
      {children}
    </>
  )
}
```
**Purpose:** Wraps pages with common layout elements
- Hides navbar on login/signup pages
- Shows scroll progress indicator
- Wraps all page content

### Routes
```javascript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/" element={<Home />} />
  <Route path="/movie/:id" element={<MovieDetails />} />
  <Route path="/api-movie-details" element={<ApiMovieDetails />} />
  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
  <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
</Routes>
```

**Route Explanation:**
- `/login` - Login page (public)
- `/signup` - Registration page (public)
- `/` - Home page (public)
- `/movie/:id` - Movie details page (public, `:id` is dynamic parameter)
- `/api-movie-details` - API movie details (public)
- `/profile` - User profile (protected - requires login)
- `/watchlist` - User watchlist (protected - requires login)

---

## Context Providers

Context providers manage global state that can be accessed by any component without prop drilling.

### 1. AuthContext (`src/context/AuthContext.jsx`)

**Purpose:** Manages user authentication state

**State:**
- `user`: Current logged-in user object
- `loading`: Loading state during auth check

**Functions:**
- `login(username, password)`: Authenticates user
  - Searches for user by username or email
  - Validates password
  - Stores user in localStorage (without password)
  - Returns success/error status

- `logout()`: Logs out user
  - Clears user state
  - Removes from localStorage

**Usage:**
```javascript
const { user, isAuthenticated, login, logout } = useAuth()
```

**localStorage Key:** `streamflix_user`

### 2. ThemeContext (`src/context/ThemeContext.jsx`)

**Purpose:** Manages dark/light theme

**State:**
- `theme`: Current theme ('dark' or 'light')
- `isDark`: Boolean for easy checks

**Functions:**
- `toggleTheme()`: Switches between dark and light mode

**localStorage Key:** `streamflix_theme`

**How it works:**
- Applies `dark` or `light` class to document root
- CSS uses these classes for theme-specific styles

### 3. SearchHistoryContext (`src/context/SearchHistoryContext.jsx`)

**Purpose:** Tracks user search history

**State:**
- `searchHistory`: Array of recent search terms (max 10)

**Functions:**
- `addToHistory(term)`: Adds search term to history
- `clearHistory()`: Clears all history
- `removeFromHistory(index)`: Removes specific term

**localStorage Key:** `streamflix_search_history`

### 4. RecentlyViewedContext (`src/context/RecentlyViewedContext.jsx`)

**Purpose:** Tracks recently viewed movies

**State:**
- `recentlyViewed`: Array of recently viewed movies (max 10)

**Functions:**
- `addToRecentlyViewed(movie)`: Adds movie to history
- `clearRecentlyViewed()`: Clears all history

**localStorage Key:** `streamflix_recently_viewed`

**How it works:**
- Automatically called when user views a movie
- Used for recommendations
- Removes duplicates (moves to top if already exists)

---

## Pages

Pages are route components that represent different screens in the app.

### 1. Home Page (`src/pages/Home.jsx`)

**Purpose:** Main landing page with movie browsing

**Key Features:**

**State Management:**
```javascript
const [movies, setMovies] = useState([])           // All movies from database
const [allResults, setAllResults] = useState([])    // Filtered local results
const [apiResults, setApiResults] = useState([])     // API search results
const [searchTerm, setSearchTerm] = useState('')     // Search input value
const [selectedGenre, setSelectedGenre] = useState('All')
const [selectedYear, setSelectedYear] = useState('All')
const [selectedRating, setSelectedRating] = useState('All')
```

**Hero Section:**
- Shows featured movie (top-rated)
- Large poster background with gradient overlay
- Glowing title effect
- Action buttons (Watch Now, Add to List, Info)
- Only displays when no search is active

**Search Functionality:**
- Unified search: searches both local database and IMDb API
- Debounced API calls (500ms delay to avoid excessive requests)
- Search history dropdown
- Real-time filtering

**Filtering:**
- Genre filter: Filter by movie genre
- Year filter: Filter by release year
- Rating filter: Filter by minimum rating (5+, 6+, 7+, 8+, 9+)

**Sections:**
1. **Trending Movies** - Highest rated, most recent
2. **Recently Viewed** - Movies user has viewed
3. **Recommended For You** - Based on viewing history
4. **Top Movies** - Highest rated movies
5. **Genre Sections** - Movies grouped by genre

**Keyboard Shortcuts:**
- `/` - Focus search bar
- `Esc` - Clear search

**Functions:**
- `fetchMovies()`: Loads all movies from database
- `searchApiMovies(query)`: Searches IMDb API
- `getTrendingMovies()`: Returns trending movies
- `getRecommendedMovies()`: Returns personalized recommendations

### 2. MovieDetails Page (`src/pages/MovieDetails.jsx`)

**Purpose:** Displays detailed information about a movie

**Features:**
- Large poster image with hover play button
- Movie information (title, year, rating, genre, director, cast, synopsis)
- Trailer player (YouTube or direct video)
- Add/Remove from watchlist
- Back to home button
- Automatically tracks as recently viewed

**URL Parameter:** `:id` - Movie ID from route

**State:**
- `movie`: Movie data object
- `loading`: Loading state
- `inWatchlist`: Whether movie is in watchlist
- `showTrailer`: Controls trailer modal visibility

### 3. ApiMovieDetails Page (`src/pages/ApiMovieDetails.jsx`)

**Purpose:** Displays details for movies from IMDb API

**Differences from MovieDetails:**
- Fetches data from external API instead of local database
- Handles different API response structure
- Uses `getSafeValue()` to safely extract nested values

**Navigation:** Receives movie data via React Router state

### 4. Watchlist Page (`src/pages/Watchlist.jsx`)

**Purpose:** Shows user's saved movies

**Features:**
- Displays all movies in watchlist
- Remove from watchlist button on each card
- Empty state message when watchlist is empty
- Protected route (requires login)

**API Calls:**
- `watchlistAPI.getAllWatchlist()`: Fetches all watchlist items
- `watchlistAPI.removeFromWatchlist(id)`: Removes movie

### 5. Profile Page (`src/pages/Profile.jsx`)

**Purpose:** User profile and statistics

**Features:**
- User information display
- Statistics cards:
  - Movies in watchlist count
  - Total movies available
  - Average rating
- Additional stats:
  - Favorite genre
  - Estimated watch time
- Settings:
  - Theme toggle
  - Logout button

**Protected Route:** Requires authentication

### 6. Login Page (`src/pages/Login.jsx`)

**Purpose:** User authentication

**Features:**
- Username/Email input
- Password input with show/hide toggle
- Form validation
- Loading state during login
- Link to signup page
- Link back to home

**Authentication Flow:**
1. User enters credentials
2. Searches database for user (by username or email)
3. Validates password
4. Stores user in context and localStorage
5. Redirects to home page

### 7. Signup Page (`src/pages/Signup.jsx`)

**Purpose:** User registration

**Features:**
- Full name input
- Username input
- Email input with validation
- Password input with show/hide toggle
- Confirm password input
- Form validation:
  - All fields required
  - Password minimum 6 characters
  - Passwords must match
  - Valid email format
  - Username/email uniqueness check

**Registration Flow:**
1. Validates all inputs
2. Checks if username/email already exists
3. Creates new user in database
4. Redirects to login page

---

## Components

Reusable UI components used throughout the app.

### 1. MovieCard (`src/components/MovieCard.jsx`)

**Purpose:** Displays a movie card with poster and basic info

**Props:**
- `movie`: Movie object with all movie data
- `showQuickView`: Boolean to show/hide quick view button

**Features:**
- Movie poster image (lazy loaded)
- Movie title (clickable link)
- Year and duration
- Rating badge with star icon
- Genre badge
- "In Watchlist" indicator
- Quick view button (eye icon on hover)
- Add to watchlist button
- Hover animations (scale, glow, lift)

**State:**
- `inWatchlist`: Whether movie is in user's watchlist
- `showQuickModal`: Controls quick view modal visibility

**Interactions:**
- Click title/poster → Navigate to movie details
- Click quick view → Opens QuickViewModal
- Click bookmark → Add/remove from watchlist

### 2. ApiMovieCard (`src/components/ApiMovieCard.jsx`)

**Purpose:** Similar to MovieCard but for API movies

**Differences:**
- Handles different API response structure
- Uses `getSafeValue()` to safely extract values
- Shows "API" badge
- Entire card is clickable (navigates to ApiMovieDetails)

### 3. QuickViewModal (`src/components/QuickViewModal.jsx`)

**Purpose:** Quick preview modal without navigation

**Features:**
- Full-screen overlay with backdrop blur
- Movie poster with hover play button
- Movie details (title, year, rating, genre, synopsis, director)
- Action buttons:
  - "View Details" - Navigate to full details page
  - "Add to Watchlist" - Add movie to watchlist
- Close button (X)
- Click outside to close

**Props:**
- `movie`: Movie object
- `onClose`: Function to close modal
- `onAddToWatchlist`: Optional callback after adding

### 4. VideoPlayer (`src/components/VideoPlayer.jsx`)

**Purpose:** Custom video player for trailers

**Features:**
- Supports YouTube URLs (auto-converts to embed)
- Supports direct video URLs
- Video controls:
  - Play/Pause
  - Volume control
  - Progress bar (seekable)
  - Fullscreen toggle
  - Time display
- Close button
- Play button overlay when paused

**Props:**
- `videoUrl`: URL of video/trailer
- `title`: Video title
- `onClose`: Function to close player

**YouTube Handling:**
- Detects YouTube URLs
- Converts to embeddable format
- Uses iframe for YouTube videos

### 5. Navbar (`src/components/Navbar.jsx`)

**Purpose:** Main navigation bar

**Features:**
- Streamflix logo (clickable, goes to home)
- Navigation links:
  - Home
  - Watchlist (if logged in)
  - Profile (if logged in)
- Theme toggle button (sun/moon icon)
- User section:
  - User name/avatar (if logged in)
  - Logout button (if logged in)
  - Login/Signup buttons (if not logged in)
- Active route highlighting
- Sticky positioning (stays at top when scrolling)

**Uses:**
- `useAuth()`: For authentication state
- `useTheme()`: For theme state
- `useLocation()`: For active route detection

### 6. SkeletonLoader (`src/components/SkeletonLoader.jsx`)

**Purpose:** Loading placeholder for movies

**Features:**
- Animated shimmer effect
- Matches movie card layout
- Shows while data is loading
- Theme-aware (dark/light mode)

**Props:**
- `count`: Number of skeleton cards to show
- `className`: Additional CSS classes

### 7. LazyImage (`src/components/LazyImage.jsx`)

**Purpose:** Lazy loads images for performance

**How it works:**
1. Initially shows placeholder image
2. Uses Intersection Observer API
3. When image enters viewport, loads actual image
4. Smooth fade-in transition when loaded

**Benefits:**
- Faster initial page load
- Reduces bandwidth usage
- Better performance on slow connections

**Props:**
- `src`: Image URL
- `alt`: Alt text
- `className`: CSS classes
- `placeholder`: Placeholder image URL

### 8. ScrollProgress (`src/components/ScrollProgress.jsx`)

**Purpose:** Shows scroll progress at top of page

**Features:**
- Thin progress bar at top
- Gradient color (blue to purple)
- Updates as user scrolls
- Smooth animation

**How it works:**
- Listens to scroll events
- Calculates scroll percentage
- Updates bar width based on scroll position

---

## Services/API

Service files handle all API communication.

### 1. API Service (`src/services/api.js`)

**Purpose:** Handles communication with JSON-Server (local database)

**Base Configuration:**
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3001'
})
```

**Axios Interceptor:**
- Catches network errors
- Shows toast notification if server is not running
- Helps with debugging

**APIs:**

**moviesAPI:**
- `getAllMovies()`: GET `/movies` - Get all movies
- `getMovieById(id)`: GET `/movies/:id` - Get single movie
- `createMovie(movieData)`: POST `/movies` - Add new movie
- `updateMovie(id, movieData)`: PUT `/movies/:id` - Update movie
- `deleteMovie(id)`: DELETE `/movies/:id` - Delete movie
- `getMoviesByGenre(genre)`: GET `/movies?genre=:genre` - Filter by genre

**watchlistAPI:**
- `getAllWatchlist()`: GET `/watchlist` - Get all watchlist items
- `addToWatchlist(movie)`: POST `/watchlist` - Add movie to watchlist
- `removeFromWatchlist(id)`: DELETE `/watchlist/:id` - Remove from watchlist
- `isInWatchlist(movieId)`: GET `/watchlist?movieId=:id` - Check if in watchlist

**usersAPI:**
- `registerUser(userData)`: POST `/users` - Create new user
- `findUserByUsername(username)`: GET `/users?username=:username`
- `findUserByEmail(email)`: GET `/users?email=:email`
- `checkUsernameExists(username)`: GET `/users?username=:username`
- `checkEmailExists(email)`: GET `/users?email=:email`

### 2. External API Service (`src/services/externalApi.js`)

**Purpose:** Handles communication with IMDb RapidAPI

**Base Configuration:**
```javascript
const externalApi = axios.create({
  baseURL: 'https://imdb8.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': 'YOUR_API_KEY',
    'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
  }
})
```

**APIs:**

- `autoComplete(query)`: GET `/title/auto-complete?q=:query`
  - Returns movie suggestions as user types
  
- `getMovieOverview(movieId)`: GET `/title/get-overview-details?tconst=:id`
  - Returns detailed movie information

**Error Handling:**
- Handles rate limit errors (429 status)
- Shows user-friendly error messages

---

## Utilities

### YouTube Utils (`src/utils/youtubeUtils.js`)

**Purpose:** Handles YouTube URL conversion

**Functions:**

**`isYouTubeUrl(url)`**
- Checks if URL is a YouTube URL
- Supports multiple formats:
  - `youtube.com/watch?v=...`
  - `youtu.be/...`
  - `youtube.com/embed/...`

**`getYouTubeEmbedUrl(url)`**
- Converts YouTube URL to embeddable format
- Extracts video ID
- Returns: `https://www.youtube.com/embed/:videoId`

**Why needed:**
- YouTube URLs come in various formats
- Need consistent embed format for iframe
- Handles URL parameters (autoplay, controls, etc.)

---

## Styling

### Global Styles (`src/index.css`)

**Tailwind Directives:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- Imports Tailwind CSS framework

**Custom Animations:**
- `slideInUp`, `slideInDown`, `slideInLeft`, `slideInRight`: Slide animations
- `scaleIn`: Scale animation
- `bounce`: Bounce animation
- `float`: Floating animation
- `glow`: Glowing effect animation
- `shimmer`: Shimmer loading effect
- `gradient`: Animated gradient background

**Custom Classes:**
- `.hover-lift`: Lifts element on hover
- `.hover-scale`: Scales element on hover
- `.hover-glow`: Adds glow on hover
- `.glass-effect`: Glassmorphism effect
- `.gradient-text`: Animated gradient text
- `.skeleton`: Loading skeleton animation
- `.ripple`: Ripple click effect

**Theme Styles:**
- `.dark` and `.light` classes for theme switching
- Custom scrollbar styling
- Selection color styling

**Responsive Design:**
- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Flexible grid layouts

---

## Data Flow

### 1. User Authentication Flow
```
User enters credentials → Login page
  → AuthContext.login()
    → usersAPI.findUserByUsername/Email()
      → JSON-Server validates
        → Success: Store in context & localStorage
        → Error: Show error message
```

### 2. Movie Search Flow
```
User types in search → Home page
  → Debounce (500ms)
    → Filter local movies
    → externalMovieAPI.autoComplete()
      → Display results
        → User clicks movie
          → Navigate to details
            → Track as recently viewed
```

### 3. Watchlist Flow
```
User clicks bookmark → MovieCard
  → watchlistAPI.addToWatchlist()
    → JSON-Server stores
      → Update UI (show "In Watchlist" badge)
        → Show success toast
```

### 4. Theme Toggle Flow
```
User clicks theme button → Navbar
  → ThemeContext.toggleTheme()
    → Update theme state
      → Apply class to document
        → CSS updates colors
          → Save to localStorage
```

---

## Key Concepts Explained

### 1. React Hooks

**useState:**
- Manages component state
- Returns [value, setter function]
- Triggers re-render on change

**useEffect:**
- Runs side effects (API calls, subscriptions)
- Dependency array controls when it runs
- Cleanup function for cleanup

**useContext:**
- Accesses context values
- Avoids prop drilling
- Re-renders when context changes

**useRef:**
- Stores mutable values
- Doesn't trigger re-render
- Used for DOM references, timers

**useLocation:**
- Gets current route location
- Used for active route detection

**useNavigate:**
- Programmatic navigation
- Alternative to Link component

**useParams:**
- Gets route parameters
- Example: `/movie/:id` → `{ id: "1" }`

### 2. Context API

**Why use Context?**
- Avoids prop drilling (passing props through many components)
- Global state management
- Shared state across components

**Provider Pattern:**
```javascript
<ContextProvider>
  <Component /> // Can access context
</ContextProvider>
```

### 3. Protected Routes

**Concept:**
- Some routes require authentication
- Check if user is logged in
- Redirect to login if not authenticated

**Implementation:**
```javascript
<ProtectedRoute>
  <Component /> // Only shown if authenticated
</ProtectedRoute>
```

### 4. Debouncing

**Why needed:**
- Prevents excessive API calls
- Improves performance
- Reduces server load

**How it works:**
- Wait for user to stop typing
- Then make API call
- Clear previous timeout if user types again

### 5. Lazy Loading

**Why needed:**
- Faster initial page load
- Better performance
- Reduces bandwidth

**How it works:**
- Intersection Observer API
- Load images when they enter viewport
- Show placeholder until loaded

### 6. Local Storage

**Purpose:**
- Persist data across sessions
- No server needed
- User preferences, history

**Usage:**
- `localStorage.setItem(key, value)` - Store
- `localStorage.getItem(key)` - Retrieve
- `localStorage.removeItem(key)` - Remove

**Stored Data:**
- User session
- Theme preference
- Search history
- Recently viewed movies

---

## API Endpoints

### JSON-Server Endpoints (Port 3001)

**Movies:**
- `GET /movies` - Get all movies
- `GET /movies/:id` - Get movie by ID
- `POST /movies` - Create movie
- `PUT /movies/:id` - Update movie
- `DELETE /movies/:id` - Delete movie

**Users:**
- `GET /users` - Get all users
- `POST /users` - Create user
- `GET /users?username=:username` - Find by username
- `GET /users?email=:email` - Find by email

**Watchlist:**
- `GET /watchlist` - Get all watchlist items
- `POST /watchlist` - Add to watchlist
- `DELETE /watchlist/:id` - Remove from watchlist
- `GET /watchlist?movieId=:id` - Check if in watchlist

### External API Endpoints (IMDb RapidAPI)

**Search:**
- `GET /title/auto-complete?q=:query` - Search movies

**Details:**
- `GET /title/get-overview-details?tconst=:id` - Get movie details

---

## Security Considerations

### Current Implementation:
- Passwords stored in plain text (NOT secure for production)
- No encryption
- No JWT tokens
- No HTTPS (local development)

### Production Recommendations:
- Hash passwords (bcrypt)
- Use JWT for authentication
- Implement HTTPS
- Add CSRF protection
- Validate and sanitize inputs
- Rate limiting on API calls

---

## Performance Optimizations

1. **Lazy Loading Images:** Images load only when visible
2. **Debounced Search:** Reduces API calls
3. **Memoization:** Could add React.memo for expensive components
4. **Code Splitting:** Vite automatically splits code
5. **CSS Purging:** Tailwind removes unused CSS
6. **Local Storage:** Reduces API calls for user data

---

## Future Enhancements

1. **User Reviews:** Allow users to rate and review movies
2. **Social Features:** Share movies, follow users
3. **Playback:** Actual video streaming
4. **Notifications:** Email/push notifications
5. **Advanced Search:** More filters, sorting options
6. **Collections:** User-created movie collections
7. **Recommendations:** ML-based recommendations
8. **Multi-language:** Support multiple languages

---

## Conclusion

This is a comprehensive movie streaming application built with modern React practices. It demonstrates:

- **Component-based architecture**
- **State management with Context API**
- **Client-side routing**
- **API integration (local + external)**
- **Responsive design**
- **User authentication**
- **Performance optimizations**
- **Modern UI/UX patterns**

The codebase is well-organized, maintainable, and follows React best practices. Each component has a single responsibility, making it easy to understand and modify.


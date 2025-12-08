import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import ApiMovieDetails from './pages/ApiMovieDetails'
import Watchlist from './pages/Watchlist'
import Profile from './pages/Profile'
import EditMovie from './pages/EditMovie'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuth } from './context/AuthContext'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Layout component to conditionally show navbar
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

function App() {
  return (
    <div className="min-h-screen dark:bg-slate-900 bg-gray-50">
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/api-movie-details" element={<ApiMovieDetails />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/watchlist" 
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-movie/:id" 
            element={
              <ProtectedRoute>
                <EditMovie />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </div>
  )
}

export default App


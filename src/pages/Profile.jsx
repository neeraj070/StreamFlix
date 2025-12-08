import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { watchlistAPI, moviesAPI } from '../services/api'
import { FaUser, FaBookmark, FaCalendarAlt, FaStar, FaFilm, FaHistory, FaCog, FaSignOutAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Profile = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [watchlistCount, setWatchlistCount] = useState(0)
  const [moviesCount, setMoviesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalWatchTime: 0,
    favoriteGenre: 'N/A',
    avgRating: 0,
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const [watchlistRes, moviesRes] = await Promise.all([
        watchlistAPI.getAllWatchlist(),
        moviesAPI.getAllMovies(),
      ])

      setWatchlistCount(watchlistRes.data.length)
      setMoviesCount(moviesRes.data.length)

      // Calculate stats
      const watchlist = watchlistRes.data
      const movies = moviesRes.data

      // Favorite genre
      const genreCounts = {}
      watchlist.forEach(item => {
        if (item.genre) {
          genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1
        }
      })
      const favoriteGenre = Object.keys(genreCounts).reduce((a, b) => 
        genreCounts[a] > genreCounts[b] ? a : b, 'N/A'
      )

      // Average rating
      const ratings = watchlist
        .map(item => parseFloat(item.rating))
        .filter(r => !isNaN(r))
      const avgRating = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 0

      setStats({
        favoriteGenre,
        avgRating,
        totalWatchTime: watchlist.length * 120, // Estimate 2 hours per movie
      })
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      {/* Profile Header */}
      <div className={`rounded-lg overflow-hidden shadow-xl mb-8 animate-scale-in glass-effect ${
        isDark ? 'bg-slate-800/80' : 'bg-white/80'
      }`}>
        <div className={`h-32 bg-gradient-primary relative overflow-hidden`}>
          <div className="animated-bg absolute inset-0 opacity-30"></div>
          <div className="absolute bottom-0 left-8 transform translate-y-1/2 z-10">
            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center animate-scale-in hover-scale shadow-2xl ${
              isDark ? 'bg-slate-800 border-slate-800' : 'bg-white border-white'
            }`}>
              <FaUser className="text-4xl text-primary-600 animate-float" />
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {user?.name || user?.username || 'User'}
          </h1>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
            {user?.email || 'No email provided'}
          </p>
          {user?.role && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
              user.role === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-blue-600 text-white'
            }`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-lg p-6 shadow-lg animate-slide-in-up stagger-1 hover-lift glass-effect ${
          isDark ? 'bg-slate-800/80' : 'bg-white/80'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <FaBookmark className="text-primary-500 text-2xl animate-bounce-slow" />
            <span className={`text-3xl font-bold text-gradient-animated ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {watchlistCount}
            </span>
          </div>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>In Watchlist</p>
        </div>

        <div className={`rounded-lg p-6 shadow-lg animate-slide-in-up stagger-2 hover-lift glass-effect ${
          isDark ? 'bg-slate-800/80' : 'bg-white/80'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <FaFilm className="text-primary-500 text-2xl animate-bounce-slow" />
            <span className={`text-3xl font-bold text-gradient-animated ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {moviesCount}
            </span>
          </div>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Total Movies</p>
        </div>

        <div className={`rounded-lg p-6 shadow-lg animate-slide-in-up stagger-3 hover-lift glass-effect ${
          isDark ? 'bg-slate-800/80' : 'bg-white/80'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <FaStar className="text-yellow-500 text-2xl animate-bounce-slow" />
            <span className={`text-3xl font-bold text-gradient-animated ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.avgRating}
            </span>
          </div>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Avg Rating</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className={`rounded-lg p-6 shadow-lg mb-8 animate-slide-in-up stagger-4 hover-lift glass-effect ${
        isDark ? 'bg-slate-800/80' : 'bg-white/80'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Your Statistics
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Favorite Genre</span>
            <span className={`font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {stats.favoriteGenre}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Estimated Watch Time</span>
            <span className={`font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {Math.floor(stats.totalWatchTime / 60)} hours
            </span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className={`rounded-lg p-6 shadow-lg animate-slide-in-up stagger-5 hover-lift glass-effect ${
        isDark ? 'bg-slate-800/80' : 'bg-white/80'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Settings
        </h2>
        <div className="space-y-4">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover-scale ripple ${
              isDark
                ? 'bg-slate-700 hover:bg-slate-600 text-white hover-glow'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FaCog className="animate-spin-slow" />
              <span>Theme</span>
            </div>
            <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover-scale hover-glow ripple shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <FaSignOutAlt />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile

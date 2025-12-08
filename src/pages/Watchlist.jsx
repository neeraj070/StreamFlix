import { useState, useEffect } from 'react'
import { watchlistAPI } from '../services/api'
import MovieCard from '../components/MovieCard'
import { FaBookmark } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useTheme } from '../context/ThemeContext'

const Watchlist = () => {
  const { isDark } = useTheme()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const response = await watchlistAPI.getAllWatchlist()
      setWatchlist(response.data)
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      toast.error('Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWatchlist = async (id) => {
    try {
      await watchlistAPI.removeFromWatchlist(id)
      setWatchlist(watchlist.filter(item => item.id !== id))
      toast.success('Removed from watchlist!')
    } catch (error) {
      console.error('Error removing from watchlist:', error)
      toast.error('Failed to remove from watchlist')
    }
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
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center space-x-3 mb-8 animate-slide-in-down">
        <FaBookmark className={`text-4xl animate-float ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
        <div>
          <h1 className={`text-4xl md:text-5xl font-bold text-gradient-animated ${isDark ? 'text-white' : 'text-gray-900'}`}>My Watchlist</h1>
          <p className={`mt-1 text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} saved
          </p>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-16 animate-scale-in">
          <FaBookmark className={`text-6xl mx-auto mb-4 animate-float ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
          <p className={`text-2xl mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Your watchlist is empty</p>
          <p className={isDark ? 'text-slate-500' : 'text-gray-500'}>Start adding movies to your watchlist!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {watchlist.map((item, index) => (
            <div key={item.id} className={`relative animate-slide-in-up stagger-${Math.min(index + 1, 5)}`}>
              <MovieCard movie={item} />
              <button
                onClick={() => handleRemoveFromWatchlist(item.id)}
                className="absolute top-2 right-2 z-10 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 hover-scale hover-glow ripple shadow-lg"
                title="Remove from Watchlist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Watchlist


import { useEffect } from 'react'
import { FaTimes, FaStar, FaCalendarAlt, FaClock, FaBookmark, FaPlay } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { watchlistAPI } from '../services/api'
import { useState } from 'react'
import { toast } from 'react-toastify'

const QuickViewModal = ({ movie, onClose, onAddToWatchlist }) => {
  const { isDark } = useTheme()
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    if (movie?.id) {
      checkWatchlist()
    }
  }, [movie])

  const checkWatchlist = async () => {
    try {
      const response = await watchlistAPI.isInWatchlist(movie.id)
      setInWatchlist(response.data.length > 0)
    } catch (error) {
      // Ignore errors
    }
  }

  const handleAddToWatchlist = async () => {
    try {
      await watchlistAPI.addToWatchlist({
        movieId: movie.id,
        ...movie
      })
      setInWatchlist(true)
      toast.success(`${movie.title} added to watchlist!`)
      if (onAddToWatchlist) onAddToWatchlist()
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Movie already in watchlist!')
      } else {
        toast.error('Failed to add to watchlist')
      }
    }
  }

  if (!movie) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`relative max-w-4xl w-full rounded-lg overflow-hidden shadow-2xl animate-scale-in glass-effect ${
          isDark ? 'bg-slate-800/95' : 'bg-white/95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all duration-300 hover-scale hover-glow ripple"
        >
          <FaTimes />
        </button>

        <div className="md:flex">
          {/* Poster */}
          <div className="md:w-1/3 relative group overflow-hidden">
            <img
              src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Image'}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x750?text=No+Image'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {movie.trailer && (
              <Link
                to={`/movie/${movie.id}`}
                className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/60 transition-all duration-300"
              >
                <div className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-6 transform scale-0 group-hover:scale-100 transition-transform duration-300 hover-glow shadow-2xl">
                  <FaPlay size={40} className="ml-1 animate-bounce-slow" />
                </div>
              </Link>
            )}
          </div>

          {/* Details */}
          <div className="md:w-2/3 p-6 md:p-8 animate-slide-in-right">
            <h2 className={`text-3xl md:text-4xl font-bold mb-3 text-gradient-animated ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {movie.title}
            </h2>

            <div className={`flex items-center space-x-4 mb-4 flex-wrap ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              <div className="flex items-center space-x-1">
                <FaCalendarAlt />
                <span>{movie.year}</span>
              </div>
              {movie.duration && (
                <div className="flex items-center space-x-1">
                  <FaClock />
                  <span>{movie.duration}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <FaStar className="text-yellow-400" />
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{movie.rating}</span>
              </div>
            </div>

            {movie.genre && (
              <div className="mb-4">
                <span className="px-3 py-1 bg-gradient-primary text-white text-sm rounded-full font-semibold shadow-lg">
                  {movie.genre}
                </span>
              </div>
            )}

            {movie.synopsis && (
              <p className={`text-sm md:text-base mb-6 line-clamp-4 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                {movie.synopsis}
              </p>
            )}

            {movie.director && (
              <div className="mb-4">
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Director: <span className={isDark ? 'text-white' : 'text-gray-900'}>{movie.director}</span>
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/movie/${movie.id}`}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300 hover-scale hover-glow ripple shadow-lg"
                onClick={onClose}
              >
                <span>View Details</span>
              </Link>
              
              {!inWatchlist ? (
                <button
                  onClick={handleAddToWatchlist}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-primary-600 text-white rounded-lg transition-all duration-300 hover-scale hover-glow ripple"
                >
                  <FaBookmark />
                  <span>Add to Watchlist</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg">
                  <FaBookmark />
                  <span>In Watchlist</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal



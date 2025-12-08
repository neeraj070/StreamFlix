import { useNavigate } from 'react-router-dom'
import { FaStar, FaCalendarAlt, FaClock } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { watchlistAPI } from '../services/api'
import { useState, useEffect } from 'react'

const ApiMovieCard = ({ movie }) => {
  const navigate = useNavigate()
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    if (movie.id) {
      checkWatchlist()
    }
  }, [movie.id])

  const checkWatchlist = async () => {
    try {
      const response = await watchlistAPI.isInWatchlist(movie.id)
      setInWatchlist(response.data.length > 0)
    } catch (error) {
      // Ignore errors for API movies
    }
  }

  const handleAddToWatchlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const movieData = {
        movieId: movie.id || movie.tconst,
        ...movie
      }
      await watchlistAPI.addToWatchlist(movieData)
      setInWatchlist(true)
      toast.success(`${movie.title || movie.titleText?.text || 'Movie'} added to watchlist!`)
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Movie already in watchlist!')
      } else {
        toast.error('Failed to add to watchlist')
      }
    }
  }


  // Safely extract values to prevent object rendering errors
  const getSafeValue = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'string' || typeof value === 'number') return value
    if (typeof value === 'object') {
      if (value.text) return value.text
      if (value.year) return value.year
      if (value.url) return value.url
      if (value.aggregateRating) return value.aggregateRating
      if (value.rating) return value.rating
      return fallback
    }
    return String(value)
  }

  const movieTitle = getSafeValue(movie.title) || 
                     getSafeValue(movie.titleText) || 
                     'Unknown Title'
  const movieYear = getSafeValue(movie.year) || 
                    getSafeValue(movie.releaseYear) || 
                    'N/A'
  const movieImage = getSafeValue(movie.image) || 
                     getSafeValue(movie.primaryImage) || 
                     'https://via.placeholder.com/300x450?text=No+Image'
  const movieRating = getSafeValue(movie.ratings) || 
                      getSafeValue(movie.ratingsSummary) || 
                      'N/A'

  const handleCardClick = () => {
    navigate('/api-movie-details', { state: { movie } })
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-slate-800 dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg hover-lift relative group cursor-pointer border-2 border-transparent hover:border-primary-500 animate-slide-in-up card-flip"
    >
      <div className="card-flip-inner">
        <div className="relative overflow-hidden">
          <img
            src={movieImage}
            alt={movieTitle}
            className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1 animate-scale-in hover-glow">
            <FaStar className="text-yellow-400 animate-bounce-slow" />
            <span className="text-white font-semibold text-sm">{movieRating}</span>
          </div>
          {inWatchlist && (
            <div className="absolute top-2 left-12 bg-primary-600 px-3 py-1.5 rounded-full animate-scale-in shadow-lg">
              <span className="text-white text-xs font-semibold">In Watchlist</span>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-blue-600 px-3 py-1.5 rounded-full z-10 animate-scale-in shadow-lg hover-scale">
            <span className="text-white text-xs font-semibold">API</span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors duration-300">
            {movieTitle}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
            <div className="flex items-center space-x-1 hover:text-white transition-colors">
              <FaCalendarAlt className="animate-pulse" />
              <span>{movieYear}</span>
            </div>
            {movie.runtime && (
              <div className="flex items-center space-x-1 hover:text-white transition-colors">
                <FaClock />
                <span>{movie.runtime.seconds ? `${Math.floor(movie.runtime.seconds / 60)} min` : 'N/A'}</span>
              </div>
            )}
          </div>
          
          {movie.plot && (
            <p className="text-slate-400 text-sm mb-3 line-clamp-2 group-hover:text-slate-300 transition-colors">
              {movie.plot.plotText?.plainText || movie.plot}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold shadow-lg hover-scale">
              {movie.titleType || 'Movie'}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAddToWatchlist(e)
              }}
              className="p-2 bg-slate-700 hover:bg-primary-600 text-white rounded-full transition-all duration-300 hover-scale hover-glow ripple z-10"
              title="Add to Watchlist"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiMovieCard


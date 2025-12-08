import { Link } from 'react-router-dom'
import { FaStar, FaCalendarAlt, FaClock, FaEye } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { watchlistAPI } from '../services/api'
import { useState, useEffect } from 'react'
import QuickViewModal from './QuickViewModal'
import LazyImage from './LazyImage'

const MovieCard = ({ movie, showQuickView = true }) => {
  const [inWatchlist, setInWatchlist] = useState(false)
  const [showQuickModal, setShowQuickModal] = useState(false)

  useEffect(() => {
    checkWatchlist()
  }, [movie.id])

  const checkWatchlist = async () => {
    try {
      const response = await watchlistAPI.isInWatchlist(movie.id)
      setInWatchlist(response.data.length > 0)
    } catch (error) {
      console.error('Error checking watchlist:', error)
    }
  }

  const handleAddToWatchlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await watchlistAPI.addToWatchlist({
        movieId: movie.id,
        ...movie
      })
      setInWatchlist(true)
      toast.success(`${movie.title} added to watchlist!`)
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Movie already in watchlist!')
      } else {
        toast.error('Failed to add to watchlist')
      }
    }
  }


  return (
    <>
      <div className="group animate-slide-in-up relative">
        <div className="bg-slate-800 dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg hover-lift border-2 border-transparent hover:border-primary-500 relative card-flip">
          <div className="card-flip-inner">
            <div className="relative overflow-hidden">
              <Link to={`/movie/${movie.id}`}>
                <LazyImage
                  src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Image'}
                  alt={movie.title}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              </Link>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1 animate-scale-in hover-glow">
                <FaStar className="text-yellow-400 animate-bounce-slow" />
                <span className="text-white font-semibold">{movie.rating}</span>
              </div>
              {inWatchlist && (
                <div className="absolute top-2 left-2 bg-primary-600 px-3 py-1.5 rounded-full animate-scale-in shadow-lg">
                  <span className="text-white text-xs font-semibold">In Watchlist</span>
                </div>
              )}
              {showQuickView && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowQuickModal(true)
                  }}
                  className="absolute bottom-2 right-2 bg-primary-600/90 hover:bg-primary-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover-scale hover-glow ripple"
                  title="Quick View"
                >
                  <FaEye />
                </button>
              )}
            </div>
            
            <div className="p-4">
              <Link to={`/movie/${movie.id}`}>
                <h3 className="text-xl font-bold text-white dark:text-white mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors duration-300">
                  {movie.title}
                </h3>
              </Link>
              
              <div className="flex items-center justify-between text-sm text-slate-400 dark:text-slate-400 mb-3">
                <div className="flex items-center space-x-1 hover:text-white transition-colors">
                  <FaCalendarAlt className="animate-pulse" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center space-x-1 hover:text-white transition-colors">
                  <FaClock />
                  <span>{movie.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-gradient-primary text-white text-xs rounded-full font-semibold shadow-lg hover-scale">
                  {movie.genre}
                </span>
                
                <button
                  onClick={handleAddToWatchlist}
                  className="p-2 bg-slate-700 hover:bg-primary-600 text-white rounded-full transition-all duration-300 hover-scale hover-glow ripple"
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
      </div>
      {showQuickModal && (
        <QuickViewModal
          movie={movie}
          onClose={() => setShowQuickModal(false)}
        />
      )}
    </>
  )
}

export default MovieCard


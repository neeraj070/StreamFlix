import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { moviesAPI, watchlistAPI } from '../services/api'
import { FaStar, FaCalendarAlt, FaClock, FaUser, FaArrowLeft, FaBookmark, FaPlay } from 'react-icons/fa'
import { toast } from 'react-toastify'
import VideoPlayer from '../components/VideoPlayer'
import { useTheme } from '../context/ThemeContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'

const MovieDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { addToRecentlyViewed } = useRecentlyViewed()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    fetchMovie()
    checkWatchlist()
  }, [id])

  useEffect(() => {
    if (movie) {
      addToRecentlyViewed(movie)
    }
  }, [movie, addToRecentlyViewed])

  const fetchMovie = async () => {
    try {
      setLoading(true)
      const response = await moviesAPI.getMovieById(id)
      setMovie(response.data)
    } catch (error) {
      console.error('Error fetching movie:', error)
      toast.error('Failed to load movie details')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const checkWatchlist = async () => {
    try {
      const response = await watchlistAPI.isInWatchlist(parseInt(id))
      setInWatchlist(response.data.length > 0)
    } catch (error) {
      console.error('Error checking watchlist:', error)
    }
  }

  const handleAddToWatchlist = async () => {
    try {
      await watchlistAPI.addToWatchlist({
        movieId: movie.id,
        ...movie
      })
      setInWatchlist(true)
      toast.success('Added to watchlist!')
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Already in watchlist!')
      } else {
        toast.error('Failed to add to watchlist')
      }
    }
  }

  const handleRemoveFromWatchlist = async () => {
    try {
      const response = await watchlistAPI.isInWatchlist(movie.id)
      if (response.data.length > 0) {
        await watchlistAPI.removeFromWatchlist(response.data[0].id)
        setInWatchlist(false)
        toast.success('Removed from watchlist!')
      }
    } catch (error) {
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

  if (!movie) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Link
        to="/"
        className={`inline-flex items-center space-x-2 mb-6 transition-all duration-300 hover-scale animate-slide-in-left ${
          isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <FaArrowLeft className="animate-bounce-slow" />
        <span>Back to Home</span>
      </Link>

      {/* Trailer Player Modal */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <VideoPlayer 
              videoUrl={movie.trailer} 
              title={movie.title}
              onClose={() => setShowTrailer(false)}
            />
          </div>
        </div>
      )}

      <div className={`rounded-lg overflow-hidden shadow-xl animate-scale-in glass-effect ${
        isDark ? 'bg-slate-800/80' : 'bg-white/80'
      }`}>
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
              <button
                onClick={() => setShowTrailer(true)}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300"
              >
                <div className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-6 transform scale-0 group-hover:scale-100 transition-transform duration-300 hover-glow shadow-2xl">
                  <FaPlay size={40} className="ml-1 animate-bounce-slow" />
                </div>
              </button>
            )}
          </div>

          {/* Details */}
          <div className="md:w-2/3 p-8 animate-slide-in-right">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className={`text-4xl font-bold mb-2 text-gradient-animated ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{movie.title}</h1>
                <div className={`flex items-center space-x-4 mb-4 ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  <div className="flex items-center space-x-1">
                    <FaCalendarAlt />
                    <span>{movie.year}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaClock />
                    <span>{movie.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-400" />
                    <span className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{movie.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 animate-scale-in">
              <span className="px-4 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold shadow-lg hover-scale inline-block">
                {movie.genre}
              </span>
            </div>

            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-2 flex items-center space-x-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <FaUser />
                <span>Director</span>
              </h2>
              <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>{movie.director}</p>
            </div>

            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Cast</h2>
              <div className="flex flex-wrap gap-2">
                {movie.cast?.map((actor, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDark 
                        ? 'bg-slate-700 text-slate-300' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Synopsis</h2>
              <p className={`leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>{movie.synopsis}</p>
            </div>

            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Release Date</h2>
              <p className={isDark ? 'text-slate-300' : 'text-gray-700'}>{new Date(movie.releaseDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              {movie.trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover-scale hover-glow ripple shadow-lg"
                >
                  <FaPlay className="animate-bounce-slow" />
                  <span>Watch Trailer</span>
                </button>
              )}
              
              {inWatchlist ? (
                <button
                  onClick={handleRemoveFromWatchlist}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 hover-scale ripple ${
                    isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-white hover-glow'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <FaBookmark />
                  <span>Remove from Watchlist</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToWatchlist}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-300 hover-scale hover-glow ripple shadow-lg"
                >
                  <FaBookmark />
                  <span>Add to Watchlist</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetails


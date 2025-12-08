import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { watchlistAPI } from '../services/api'
import { externalMovieAPI } from '../services/externalApi'
import { FaStar, FaCalendarAlt, FaClock, FaArrowLeft, FaBookmark, FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'
import VideoPlayer from '../components/VideoPlayer'
import { useTheme } from '../context/ThemeContext'

const ApiMovieDetails = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const movie = location.state?.movie
  const [movieDetails, setMovieDetails] = useState(movie || null)
  const [loading, setLoading] = useState(!movie)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    if (movie && movie.tconst) {
      fetchMovieDetails()
      checkWatchlist()
    } else if (!movie) {
      navigate('/')
    }
  }, [])

  const fetchMovieDetails = async () => {
    if (!movie?.tconst) return
    
    try {
      setLoading(true)
      const overview = await externalMovieAPI.getMovieOverview(movie.tconst)
      
      // Safely extract values, handling objects
      const safeTitle = typeof overview.title === 'string' 
        ? overview.title 
        : overview.title?.text || movie.title || movie.titleText?.text || 'Unknown Title'
      
      const safeYear = typeof overview.year === 'number' || typeof overview.year === 'string'
        ? overview.year
        : overview.year?.year || movie.year || movie.releaseYear?.year || 'N/A'
      
      setMovieDetails({
        ...movie,
        title: safeTitle,
        year: safeYear,
        plot: typeof overview.plot === 'string' 
          ? overview.plot 
          : overview.plot?.plotText?.plainText || movie.plot || 'No synopsis available',
        ratings: overview.ratingsSummary || movie.ratings,
        image: overview.primaryImage || movie.image,
        primaryImage: overview.primaryImage || movie.primaryImage,
      })
    } catch (error) {
      console.error('Error fetching movie details:', error)
      // Keep the basic movie data if API call fails
    } finally {
      setLoading(false)
    }
  }

  const checkWatchlist = async () => {
    if (!movie?.id && !movie?.tconst) return
    
    try {
      const movieId = movie.id || movie.tconst
      const response = await watchlistAPI.isInWatchlist(movieId)
      setInWatchlist(response.data.length > 0)
    } catch (error) {
      console.error('Error checking watchlist:', error)
    }
  }

  const handleAddToWatchlist = async () => {
    try {
      await watchlistAPI.addToWatchlist({
        movieId: movie.id || movie.tconst,
        ...movieDetails
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
      const movieId = movie.id || movie.tconst
      const response = await watchlistAPI.isInWatchlist(movieId)
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
          <FaSpinner className="animate-spin text-primary-500" size={48} />
        </div>
      </div>
    )
  }

  if (!movieDetails) {
    return null
  }

  // Safely extract values, ensuring they're strings/numbers, not objects
  const getSafeValue = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'string' || typeof value === 'number') return value
    if (typeof value === 'object') {
      if (value.text) return value.text
      if (value.year) return value.year
      if (value.plainText) return value.plainText
      if (value.url) return value.url
      if (value.aggregateRating) return value.aggregateRating
      return fallback
    }
    return String(value)
  }

  const movieTitle = getSafeValue(movieDetails.title) || 
                     getSafeValue(movieDetails.titleText) || 
                     'Unknown Title'
  const movieYear = getSafeValue(movieDetails.year) || 
                    getSafeValue(movieDetails.releaseYear) || 
                    'N/A'
  const movieImage = getSafeValue(movieDetails.image) || 
                     getSafeValue(movieDetails.primaryImage) || 
                     'https://via.placeholder.com/500x750?text=No+Image'
  const movieRating = getSafeValue(movieDetails.ratings) || 
                      getSafeValue(movieDetails.ratingsSummary) || 
                      'N/A'
  const moviePlot = getSafeValue(movieDetails.plot) || 'No synopsis available'

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/"
        className={`inline-flex items-center space-x-2 mb-6 transition ${
          isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <FaArrowLeft />
        <span>Back to Home</span>
      </Link>

      <div className={`rounded-lg overflow-hidden shadow-xl ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="md:flex">
          {/* Poster */}
          <div className="md:w-1/3">
            <img
              src={movieImage}
              alt={movieTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x750?text=No+Image'
              }}
            />
          </div>

          {/* Details */}
          <div className="md:w-2/3 p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {movieTitle}
                </h1>
                <div className={`flex items-center space-x-4 mb-4 ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  <div className="flex items-center space-x-1">
                    <FaCalendarAlt />
                    <span>{movieYear}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-400" />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {movieRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isDark 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {movieDetails.titleType || 'Movie'} (API)
              </span>
            </div>

            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Synopsis
              </h2>
              <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {moviePlot}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {inWatchlist ? (
                <button
                  onClick={handleRemoveFromWatchlist}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition ${
                    isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <FaBookmark />
                  <span>Remove from Watchlist</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToWatchlist}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
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

export default ApiMovieDetails


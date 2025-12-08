import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { moviesAPI } from '../services/api'
import { externalMovieAPI } from '../services/externalApi'
import MovieCard from '../components/MovieCard'
import ApiMovieCard from '../components/ApiMovieCard'
import SkeletonLoader from '../components/SkeletonLoader'
import { FaSearch, FaFilter, FaSpinner, FaHistory, FaTimes, FaFire, FaClock } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useTheme } from '../context/ThemeContext'
import { useSearchHistory } from '../context/SearchHistoryContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'

const Home = () => {
  const location = useLocation()
  const { isDark } = useTheme()
  const { searchHistory, addToHistory, clearHistory } = useSearchHistory()
  const { recentlyViewed } = useRecentlyViewed()
  const [movies, setMovies] = useState([])
  const [allResults, setAllResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [selectedYear, setSelectedYear] = useState('All')
  const [selectedRating, setSelectedRating] = useState('All')
  const [genres, setGenres] = useState([])
  const [years, setYears] = useState([])
  const [serverError, setServerError] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
  // Combined search states
  const [apiResults, setApiResults] = useState([])
  const [apiLoading, setApiLoading] = useState(false)
  const searchTimeoutRef = useRef(null)
  
  // Group movies by genre
  const moviesByGenre = genres
    .filter(g => g !== 'All')
    .reduce((acc, genre) => {
      const genreMovies = movies.filter(movie => movie.genre === genre)
      if (genreMovies.length > 0) {
        acc[genre] = genreMovies
      }
      return acc
    }, {})

  useEffect(() => {
    fetchMovies()
  }, [])

  useEffect(() => {
    // Combined search: local + API
    if (searchTerm.trim().length >= 2) {
      // Filter local movies
      let filtered = movies
      if (selectedGenre !== 'All') {
        filtered = filtered.filter(movie => movie.genre === selectedGenre)
      }
      if (selectedYear !== 'All') {
        filtered = filtered.filter(movie => movie.year === parseInt(selectedYear))
      }
      if (selectedRating !== 'All') {
        const minRating = parseFloat(selectedRating)
        filtered = filtered.filter(movie => (movie.rating || 0) >= minRating)
      }
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.synopsis.toLowerCase().includes(searchTerm.toLowerCase())
      )

      // Search API
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        searchApiMovies(searchTerm)
        addToHistory(searchTerm)
      }, 500)

      setAllResults(filtered)
    } else {
      // No search - show all local movies
      let filtered = movies
      if (selectedGenre !== 'All') {
        filtered = filtered.filter(movie => movie.genre === selectedGenre)
      }
      if (selectedYear !== 'All') {
        filtered = filtered.filter(movie => movie.year === parseInt(selectedYear))
      }
      if (selectedRating !== 'All') {
        const minRating = parseFloat(selectedRating)
        filtered = filtered.filter(movie => (movie.rating || 0) >= minRating)
      }
      setAllResults(filtered)
      setApiResults([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, selectedGenre, selectedYear, selectedRating, movies])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Press '/' to focus search
      if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        document.querySelector('input[type="text"]')?.focus()
      }
      // Press 'Escape' to clear search
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [searchTerm])

  // Get trending movies (highest rated, recent)
  const getTrendingMovies = () => {
    return [...movies]
      .sort((a, b) => {
        // Sort by rating first, then by year (newer first)
        if (b.rating !== a.rating) {
          return (b.rating || 0) - (a.rating || 0)
        }
        return (b.year || 0) - (a.year || 0)
      })
      .slice(0, 10)
  }

  // Get recommended movies based on watchlist/genre
  const getRecommendedMovies = () => {
    if (recentlyViewed.length === 0) return []
    
    // Get genres from recently viewed
    const viewedGenres = recentlyViewed.map(m => m.genre).filter(Boolean)
    const genreCounts = viewedGenres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1
      return acc
    }, {})
    
    // Find most viewed genre
    const topGenre = Object.keys(genreCounts).reduce((a, b) => 
      genreCounts[a] > genreCounts[b] ? a : b, null
    )
    
    if (!topGenre) return []
    
    // Return movies from same genre, excluding recently viewed
    const viewedIds = new Set(recentlyViewed.map(m => m.id))
    return movies
      .filter(m => m.genre === topGenre && !viewedIds.has(m.id))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10)
  }

  const fetchMovies = async () => {
    try {
      setLoading(true)
      setServerError(false)
      const response = await moviesAPI.getAllMovies()
      setMovies(response.data)
      
      // Extract unique genres
      const uniqueGenres = ['All', ...new Set(response.data.map(movie => movie.genre))]
      setGenres(uniqueGenres)
      
      // Extract unique years
      const uniqueYears = ['All', ...new Set(response.data.map(movie => movie.year).filter(Boolean).sort((a, b) => b - a))]
      setYears(uniqueYears)
    } catch (error) {
      console.error('Error fetching movies:', error)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setServerError(true)
        toast.error('Cannot connect to server. Please start JSON Server with: npm run server')
      } else {
        toast.error('Failed to load movies')
      }
    } finally {
      setLoading(false)
    }
  }

  // API Search function
  const searchApiMovies = async (query) => {
    if (!query || query.trim().length < 2) {
      setApiResults([])
      return
    }

    try {
      setApiLoading(true)
      
      const response = await externalMovieAPI.autoComplete(query)
      
      if (response && response.d && Array.isArray(response.d)) {
        const transformedResults = response.d
          .filter(item => item.qid === 'movie' || item.qid === 'tvSeries' || item.qid === 'tvMovie')
          .map((item, index) => ({
            id: item.id || `api-${index}`,
            tconst: item.id,
            title: item.l || item.titleText?.text || 'Unknown Title',
            titleText: { text: item.l || item.titleText?.text || 'Unknown Title' },
            year: item.y || item.releaseYear?.year,
            releaseYear: { year: item.y || item.releaseYear?.year },
            image: { url: item.i?.imageUrl || item.i?.url },
            primaryImage: { url: item.i?.imageUrl || item.i?.url },
            titleType: item.qid || 'movie',
            plot: item.s || item.plot?.plotText?.plainText || '',
            ratings: item.rank ? { rating: item.rank } : null,
            ratingsSummary: item.rank ? { aggregateRating: item.rank } : null,
          }))
        
        setApiResults(transformedResults)
      } else {
        setApiResults([])
      }
    } catch (error) {
      console.error('Error searching API:', error)
      setApiResults([])
      if (error.response?.status === 429) {
        toast.error('API rate limit exceeded. Please wait a moment and try again.')
      }
    } finally {
      setApiLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mb-4"></div>
          <p className={`text-xl ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Loading amazing content...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <SkeletonLoader count={10} />
        </div>
      </div>
    )
  }

  const totalResults = allResults.length + apiResults.length
  
  // Get featured movie (top rated)
  const featuredMovie = movies.length > 0 
    ? [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
    : null

  return (
    <div className="animate-fade-in">
      {/* Hero Section - Premium Streaming Style */}
      {!searchTerm && featuredMovie && (
        <div className="relative w-full h-[85vh] min-h-[600px] mb-12 overflow-hidden">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.3) 100%), url(${featuredMovie.poster || 'https://via.placeholder.com/1920x1080'})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-4 md:px-8 lg:px-12">
              <div className="max-w-2xl animate-slide-in-left">
                {/* Badge */}
                <div className="mb-4 animate-scale-in">
                  <span className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full shadow-lg">
                    #1 in Telugu Cinema
                  </span>
                </div>

                {/* Movie Title - Glowing Effect */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-tight">
                  <span 
                    className="glow-text"
                    style={{
                      color: '#ff6b35',
                      textShadow: '0 0 20px rgba(255, 107, 53, 0.8), 0 0 40px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 107, 53, 0.4)',
                      filter: 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))'
                    }}
                  >
                    {featuredMovie.title.toUpperCase()}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className={`text-xl md:text-2xl mb-6 ${isDark ? 'text-slate-300' : 'text-gray-200'}`}>
                  {featuredMovie.year} • {featuredMovie.genre} • {featuredMovie.duration}
                </p>

                {/* Synopsis */}
                <p className={`text-base md:text-lg mb-8 line-clamp-3 ${isDark ? 'text-slate-300' : 'text-gray-200'}`}>
                  {featuredMovie.synopsis || 'Experience the best of Telugu cinema with this featured masterpiece.'}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <Link
                    to={`/movie/${featuredMovie.id}`}
                    className="group flex items-center space-x-3 px-8 py-4 bg-white hover:bg-gray-100 text-black font-bold rounded-lg transition-all duration-300 hover-scale hover-glow shadow-2xl ripple"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    <span>Watch Now</span>
                  </Link>
                  
                  <button className="group flex items-center justify-center w-12 h-12 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all duration-300 hover-scale hover-glow border-2 border-white/30 ripple">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  <button className="group flex items-center justify-center w-12 h-12 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all duration-300 hover-scale hover-glow border-2 border-white/30 ripple">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>
                      {featuredMovie.rating}
                    </span>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-300'}`}>
                    Rating
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        </div>
      )}

      {/* Search Section - Only show when no search term */}
      {!searchTerm && (
        <div className="container mx-auto px-4 mb-8">
          {/* Unified Search and Filter Section */}
          <div className="mb-8 space-y-4 animate-slide-in-up stagger-1">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Unified Search Bar */}
              <div className="flex-1 relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 ${isDark ? 'text-slate-400' : 'text-gray-400'} animate-pulse`} />
                <input
                  type="text"
                  placeholder="Search movies from local database or IMDB API..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
                  onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:shadow-lg ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 glass-effect' 
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400 glass-effect'
                  }`}
                />
                {(apiLoading || (searchTerm.length >= 2 && apiLoading)) && (
                  <FaSpinner className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 animate-spin`} />
                )}
                {searchHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`absolute right-10 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FaHistory />
                  </button>
                )}
                
                {/* Search History Dropdown */}
                {showHistory && searchHistory.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-slide-in-down glass-effect ${
                    isDark ? 'bg-slate-800/95 border border-slate-700' : 'bg-white/95 border border-gray-200'
                  }`}>
                    <div className={`px-4 py-2 border-b ${
                      isDark ? 'border-slate-700' : 'border-gray-200'
                    } flex items-center justify-between`}>
                      <span className={`text-sm font-semibold ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>Recent Searches</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          clearHistory()
                          setShowHistory(false)
                        }}
                        className={`text-xs ${
                          isDark ? 'text-slate-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'
                        } transition`}
                      >
                        Clear
                      </button>
                    </div>
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(term)
                          setShowHistory(false)
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-opacity-50 transition flex items-center justify-between ${
                          isDark 
                            ? 'text-white hover:bg-slate-700' 
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <span>{term}</span>
                        <FaHistory className="text-xs opacity-50" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Genre Filter */}
              <div className="relative">
                <FaFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 ${isDark ? 'text-slate-400' : 'text-gray-400'} animate-pulse`} />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className={`pl-10 pr-8 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700 text-white glass-effect' 
                      : 'bg-white/80 border-gray-300 text-gray-900 glass-effect'
                  }`}
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`pl-4 pr-8 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700 text-white glass-effect' 
                      : 'bg-white/80 border-gray-300 text-gray-900 glass-effect'
                  }`}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className={`pl-4 pr-8 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700 text-white glass-effect' 
                      : 'bg-white/80 border-gray-300 text-gray-900 glass-effect'
                  }`}
                >
                  <option value="All">All Ratings</option>
                  <option value="9">9+ Stars</option>
                  <option value="8">8+ Stars</option>
                  <option value="7">7+ Stars</option>
                  <option value="6">6+ Stars</option>
                  <option value="5">5+ Stars</option>
                </select>
              </div>
            </div>

            {/* Results Count and Keyboard Shortcuts Hint */}
            <div className="flex items-center justify-between">
              <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                Showing {allResults.length} of {movies.length} movies
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                <kbd className={`px-2 py-1 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>/</kbd> to search, <kbd className={`px-2 py-1 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>Esc</kbd> to clear
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Section */}
      {searchTerm && (
        <div className="container mx-auto px-4 py-8">
          {/* Unified Search and Filter Section */}
          <div className="mb-8 space-y-4 animate-slide-in-up stagger-1">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Unified Search Bar */}
              <div className="flex-1 relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 ${isDark ? 'text-slate-400' : 'text-gray-400'} animate-pulse`} />
                <input
                  type="text"
                  placeholder="Search movies from local database or IMDB API..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
                  onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:shadow-lg ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-400 glass-effect' 
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400 glass-effect'
                  }`}
                />
                {(apiLoading || (searchTerm.length >= 2 && apiLoading)) && (
                  <FaSpinner className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 animate-spin`} />
                )}
                {searchHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`absolute right-10 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FaHistory />
                  </button>
                )}
                
                {/* Search History Dropdown */}
                {showHistory && searchHistory.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-slide-in-down glass-effect ${
                    isDark ? 'bg-slate-800/95 border border-slate-700' : 'bg-white/95 border border-gray-200'
                  }`}>
                    <div className={`px-4 py-2 border-b ${
                      isDark ? 'border-slate-700' : 'border-gray-200'
                    } flex items-center justify-between`}>
                      <span className={`text-sm font-semibold ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>Recent Searches</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          clearHistory()
                          setShowHistory(false)
                        }}
                        className={`text-xs ${
                          isDark ? 'text-slate-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'
                        } transition`}
                      >
                        Clear
                      </button>
                    </div>
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(term)
                          setShowHistory(false)
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-opacity-50 transition flex items-center justify-between ${
                          isDark 
                            ? 'text-white hover:bg-slate-700' 
                            : 'text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <span>{term}</span>
                        <FaHistory className="text-xs opacity-50" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Genre Filter */}
              <div className="relative">
                <FaFilter className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 ${isDark ? 'text-slate-400' : 'text-gray-400'} animate-pulse`} />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className={`pl-10 pr-8 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700 text-white glass-effect' 
                      : 'bg-white/80 border-gray-300 text-gray-900 glass-effect'
                  }`}
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={`pl-4 pr-8 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700 text-white glass-effect' 
                      : 'bg-white/80 border-gray-300 text-gray-900 glass-effect'
                  }`}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className={`pl-4 pr-8 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isDark 
                      ? 'bg-slate-800/80 border-slate-700 text-white glass-effect' 
                      : 'bg-white/80 border-gray-300 text-gray-900 glass-effect'
                  }`}
                >
                  <option value="All">All Ratings</option>
                  <option value="9">9+ Stars</option>
                  <option value="8">8+ Stars</option>
                  <option value="7">7+ Stars</option>
                  <option value="6">6+ Stars</option>
                  <option value="5">5+ Stars</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} ({allResults.length} local, {apiResults.length} from API)
            </div>
          </div>

          {/* Server Error Message */}
          {serverError && (
            <div className={`rounded-lg p-6 mb-8 border ${
              isDark ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-300'
            }`}>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>Server Connection Error</h3>
              <p className={isDark ? 'text-red-300' : 'text-red-700'}>
                Cannot connect to JSON Server. Please make sure the server is running.
              </p>
              <div className={`rounded p-4 mb-4 mt-4 ${
                isDark ? 'bg-slate-800' : 'bg-gray-100'
              }`}>
                <p className={isDark ? 'text-slate-300' : 'text-gray-700'} style={{ fontFamily: 'monospace' }}>npm run server</p>
              </div>
              <button
                onClick={fetchMovies}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Results Grid */}
          {searchTerm.length >= 2 ? (
            totalResults === 0 ? (
              <div className="text-center py-16">
                <p className={`text-2xl mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>No movies found</p>
                <p className={isDark ? 'text-slate-500' : 'text-gray-500'}>Try adjusting your search criteria</p>
              </div>
            ) : (
              <>
                {/* Local Movies */}
                {allResults.length > 0 && (
                  <div className="mb-8">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Local Movies ({allResults.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {allResults.map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                  </div>
                )}

                {/* API Results */}
                {apiResults.length > 0 && (
                  <div>
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Results from API ({apiResults.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {apiResults.map((movie) => (
                        <ApiMovieCard 
                          key={movie.id || movie.tconst} 
                          movie={movie}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          ) : null}
        </div>
      )}

      {/* Content Section - Show when no search */}
      {!searchTerm && (
        <div className="container mx-auto px-4 space-y-12">
          {/* Trending Movies Section */}
          {getTrendingMovies().length > 0 && (
            <div className="mb-12 animate-slide-in-up stagger-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FaFire className={`text-3xl ${isDark ? 'text-orange-500' : 'text-orange-600'} animate-pulse`} />
                  <h2 className={`text-2xl md:text-3xl font-bold animate-slide-in-left ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-gradient-animated">🔥 Trending Now</span>
                  </h2>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {getTrendingMovies().map((movie, index) => (
                  <div key={movie.id} className={`flex-shrink-0 w-48 md:w-56 lg:w-64 animate-slide-in-up stagger-${Math.min(index + 1, 5)}`}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Viewed Section */}
          {recentlyViewed.length > 0 && (
            <div className="mb-12 animate-slide-in-up stagger-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FaClock className={`text-2xl ${isDark ? 'text-primary-400' : 'text-primary-600'} animate-pulse`} />
                  <h2 className={`text-2xl md:text-3xl font-bold animate-slide-in-left ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-gradient-animated">Recently Viewed</span>
                  </h2>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {recentlyViewed.map((movie, index) => (
                  <div key={movie.id} className={`flex-shrink-0 w-48 md:w-56 lg:w-64 animate-slide-in-up stagger-${Math.min(index + 1, 5)}`}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {getRecommendedMovies().length > 0 && (
            <div className="mb-12 animate-slide-in-up stagger-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl md:text-3xl font-bold animate-slide-in-left ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-gradient-animated">💡 Recommended For You</span>
                </h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {getRecommendedMovies().map((movie, index) => (
                  <div key={movie.id} className={`flex-shrink-0 w-48 md:w-56 lg:w-64 animate-slide-in-up stagger-${Math.min(index + 1, 5)}`}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Movies Section - Premium Style */}
          {movies.length > 0 && (
            <div className="mb-12 animate-slide-in-up stagger-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl md:text-3xl font-bold animate-slide-in-left ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-gradient-animated">Top movies</span>
                </h2>
                <a 
                  href="#"
                  className={`text-sm font-semibold hover:underline transition ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'}`}
                >
                  See more &gt;
                </a>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[...movies]
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 10)
                  .map((movie, index) => (
                    <div key={movie.id} className={`flex-shrink-0 w-48 md:w-56 lg:w-64 animate-slide-in-up stagger-${Math.min(index + 1, 5)}`}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Featured/Top Rated Section */}
          {movies.length > 0 && (
            <div className="mb-12 animate-slide-in-up stagger-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-3xl md:text-4xl font-bold animate-slide-in-left ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-gradient-animated">⭐ Featured Movies</span>
                </h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold animate-scale-in hover-scale shadow-lg ${
                  isDark 
                    ? 'bg-yellow-600 text-white hover-glow' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  Top Rated
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...movies]
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 5)
                  .map((movie, index) => (
                    <div key={movie.id} className={`animate-slide-in-up stagger-${index + 1}`}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Genre Sections */}
          {Object.keys(moviesByGenre).length > 0 ? (
            Object.keys(moviesByGenre).map((genre, genreIndex) => {
              const genreMovies = moviesByGenre[genre]
              
              return (
                <div key={genre} className={`mb-12 animate-slide-in-up stagger-${genreIndex + 3}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-3xl md:text-4xl font-bold animate-slide-in-left ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <span className="text-gradient-animated">{genre} Movies</span>
                    </h2>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold animate-scale-in hover-scale shadow-lg ${
                      isDark 
                        ? 'bg-primary-600 text-white hover-glow' 
                        : 'bg-primary-100 text-primary-800'
                    }`}>
                      {genreMovies.length} {genreMovies.length === 1 ? 'movie' : 'movies'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {genreMovies.map((movie, index) => (
                      <div key={movie.id} className={`animate-slide-in-up stagger-${Math.min(index + 1, 5)}`}>
                        <MovieCard movie={movie} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-16">
              <p className={`text-2xl mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                No movies available
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Home

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { moviesAPI } from '../services/api'
import { FaArrowLeft, FaSave } from 'react-icons/fa'
import { toast } from 'react-toastify'

const EditMovie = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    year: new Date().getFullYear(),
    rating: 0,
    synopsis: '',
    director: '',
    cast: '',
    poster: '',
    releaseDate: '',
    duration: '',
    language: 'Telugu',
    trailer: ''
  })

  useEffect(() => {
    fetchMovie()
  }, [id])

  const fetchMovie = async () => {
    try {
      setLoading(true)
      const response = await moviesAPI.getMovieById(id)
      const movie = response.data
      setFormData({
        ...movie,
        cast: movie.cast ? movie.cast.join(', ') : ''
      })
    } catch (error) {
      console.error('Error fetching movie:', error)
      toast.error('Failed to load movie')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'rating' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title || !formData.genre || !formData.director) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const movieData = {
        ...formData,
        cast: formData.cast.split(',').map(actor => actor.trim()).filter(actor => actor)
      }
      
      await moviesAPI.updateMovie(id, movieData)
      toast.success('Movie updated successfully!')
      navigate(`/movie/${id}`)
    } catch (error) {
      console.error('Error updating movie:', error)
      toast.error('Failed to update movie')
    } finally {
      setSaving(false)
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      <div className="bg-slate-800 rounded-lg p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6">Edit Movie</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter movie title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Genre <span className="text-red-400">*</span>
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Genre</option>
                <option value="Action">Action</option>
                <option value="Comedy">Comedy</option>
                <option value="Drama">Drama</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Horror">Horror</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Year <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Rating (0-10)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 150 min"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Director <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="director"
              value={formData.director}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter director name"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Cast (comma-separated)
            </label>
            <input
              type="text"
              name="cast"
              value={formData.cast}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Actor 1, Actor 2, Actor 3"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Release Date
            </label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Poster URL
            </label>
            <input
              type="url"
              name="poster"
              value={formData.poster}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/poster.jpg"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Trailer URL
            </label>
            <input
              type="url"
              name="trailer"
              value={formData.trailer}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/trailer.mp4"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Synopsis
            </label>
            <textarea
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Enter movie synopsis"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditMovie


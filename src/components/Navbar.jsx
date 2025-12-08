import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaFilm, FaBookmark, FaUser, FaSignOutAlt, FaSignInAlt, FaSun, FaMoon, FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { toast } from 'react-toastify'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav className="bg-slate-800/95 dark:bg-slate-800/95 border-b border-slate-700 dark:border-slate-700 sticky top-0 z-50 backdrop-blur-md glass-effect animate-slide-in-down">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-white dark:text-white hover:text-primary-400 dark:hover:text-primary-400 transition-all duration-300 hover-scale group">
            <FaFilm className="text-primary-400 dark:text-primary-400 animate-float" />
            <span className="text-gradient-animated">Streamflix</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover-scale ripple ${
                isActive('/') 
                  ? 'bg-primary-600 text-white dark:bg-primary-600 dark:text-white shadow-lg hover-glow' 
                  : 'text-slate-300 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              <span>Home</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to="/watchlist"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover-scale ripple ${
                    isActive('/watchlist') 
                      ? 'bg-primary-600 text-white dark:bg-primary-600 dark:text-white shadow-lg hover-glow' 
                      : 'text-slate-300 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-slate-700 dark:hover:bg-slate-700'
                  }`}
                >
                  <FaBookmark />
                  <span>Watchlist</span>
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover-scale ripple ${
                    isActive('/profile') 
                      ? 'bg-primary-600 text-white dark:bg-primary-600 dark:text-white shadow-lg hover-glow' 
                      : 'text-slate-300 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-slate-700 dark:hover:bg-slate-700'
                  }`}
                >
                  <FaUser />
                  <span>Profile</span>
                </Link>
              </>
            )}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-700 dark:bg-slate-700 hover:bg-slate-600 dark:hover:bg-slate-600 text-white dark:text-white transition-all duration-300 hover-scale hover-glow ripple"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <FaSun className="animate-float" /> : <FaMoon className="animate-float" />}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    isActive('/profile')
                      ? 'bg-primary-600 text-white dark:bg-primary-600 dark:text-white'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <FaUserCircle />
                  <span className="text-sm">{user?.name || user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white dark:text-white rounded-lg transition-all duration-300 hover-scale hover-glow ripple shadow-lg"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signup"
                  className="px-4 py-2 text-slate-300 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-slate-700 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                    isActive('/login') 
                      ? 'bg-primary-600 text-white dark:bg-primary-600 dark:text-white' 
                      : 'bg-primary-600 dark:bg-primary-600 hover:bg-primary-700 dark:hover:bg-primary-700 text-white dark:text-white'
                  }`}
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


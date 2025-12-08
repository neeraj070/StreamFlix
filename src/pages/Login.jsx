import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaFilm, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Login = () => {
  const { isDark } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate('/');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'
    }`}>
      <div className="animated-bg absolute inset-0 opacity-20"></div>
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-in-down">
          <div className="inline-flex items-center space-x-3 mb-4">
            <FaFilm className="text-5xl text-primary-400 animate-float" />
            <h1 className={`text-4xl font-bold text-gradient-animated ${isDark ? 'text-white' : 'text-gray-900'}`}>Streamflix</h1>
          </div>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className={`rounded-lg shadow-2xl p-8 border animate-scale-in glass-effect ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Username or Email
              </label>
              <div className="relative">
                <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-300 hover-scale hover-glow ripple shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className={`mt-6 pt-6 border-t text-center ${
            isDark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <p className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold transition">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className={`transition text-sm ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;


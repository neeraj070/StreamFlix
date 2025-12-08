import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { FaFilm, FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Signup = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      // Check if username already exists
      const usernameCheck = await usersAPI.checkUsernameExists(formData.username);
      if (usernameCheck.data.length > 0) {
        toast.error('Username already exists. Please choose a different one.');
        setLoading(false);
        return;
      }

      // Check if email already exists
      const emailCheck = await usersAPI.checkEmailExists(formData.email);
      if (emailCheck.data.length > 0) {
        toast.error('Email already exists. Please use a different email.');
        setLoading(false);
        return;
      }

      // Register new user
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'user'
      };

      await usersAPI.registerUser(userData);
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.response?.status === 409) {
        toast.error('Username or email already exists');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden ${
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
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Create your account</p>
        </div>

        {/* Signup Form */}
        <div className={`rounded-lg shadow-2xl p-8 border animate-scale-in glass-effect ${
          isDark 
            ? 'bg-slate-800/80 border-slate-700' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
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
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                  minLength={6}
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

            {/* Confirm Password Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
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
                  Creating Account...
                </span>
              ) : 'Sign Up'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className={`mt-6 pt-6 border-t text-center ${
            isDark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <p className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition">
                Sign In
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

export default Signup;


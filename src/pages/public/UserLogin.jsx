import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth';

// Google SVG Logo Component
const GoogleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const UserLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Manual login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    navigate('/google-login');
  };

  const handleManualLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ email, password, remember: rememberMe });
      const role = result.user?.role || result.role || 'user';
      navigate(role === 'admin' ? '/admin' : '/user', { replace: true });
    } catch (authError) {
      setError(authError?.response?.data?.message || authError.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/login');
  };

  const handleOfficerLogin = () => {
    navigate('/officer-login');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="w-full max-w-md">
        {/* White Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
          {/* Header - SK Circle with SKIDS Text */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center justify-center">
              {/* SK Circle */}
              <div className="w-16 h-16 rounded-full bg-white shadow-lg shadow-yellow-500/30 flex items-center justify-center mb-2 border-4 border-yellow-400/50">
                <span className="text-xl font-bold text-yellow-400">SK</span>
              </div>
              {/* SKIDS Text */}
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-yellow-400">SK</span>
                <span className="text-blue-600">IDS</span>
              </span>
              {/* Tagline */}
              <p className="text-xs text-gray-400 mt-1 leading-tight">
                Sangguniang Kabataan Information<br />
                Dissemination System
              </p>
            </div>
          </div>

          {/* Login Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-800 mb-1">User Login</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sign in with your Google/Gmail account<br />
              or use your email and password below.
            </p>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                placeholder="you@email.com"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe((prev) => !prev)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-xs text-gray-400 lowercase">or continue with</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-3"
          >
            <GoogleLogo />
            Continue with Google
          </button>

          {/* Demo Account Info */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 text-center mt-4">
            Demo youth account: <span className="font-semibold">user@skids.test</span> / <span className="font-semibold">youth123</span>
          </div>

          {/* Create New Account - In a Container Box */}
          <div className="bg-blue-600 rounded-xl border border-blue-400/30 p-4 text-center hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg mt-4">
            <Link to="/terms" className="text-sm text-white font-medium transition-colors block hover:text-blue-100">
              Create New Account
            </Link>
          </div>

          {/* SK Officer Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Are you an SK Officer?{' '}
              <button 
                onClick={handleOfficerLogin}
                className="text-yellow-500 hover:text-yellow-600 font-medium transition-colors"
              >
                SK Officer Login
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <button 
              onClick={handleBackToHome}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoShieldCheckmarkOutline, IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth';

const OfficerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      const role = result.user?.role || result.role || 'admin';
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="w-full max-w-md">
        {/* White Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header - Security Icon Centered Above SKIDS */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <IoShieldCheckmarkOutline className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-yellow-400">SK</span>
                <span className="text-blue-600">IDS</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Sangguniang Kabataan Information Dissemination System
            </p>
          </div>

          {/* Login Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">SK Officer Login</h1>
            <p className="text-sm text-gray-500">
              Access is restricted to authorized SK officers only.
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Demo admin account: <span className="font-semibold">admin@skids.test</span> / <span className="font-semibold">admin123</span>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                placeholder="officer@email.com"
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 pr-12"
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 text-sm font-semibold text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Link to="/register" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Create SK Officer Account
            </Link>
          </div>

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

export default OfficerLogin;

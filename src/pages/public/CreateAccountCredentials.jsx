import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import skidsLogo from '../../assets/images/skids.svg';
import { useAuth } from '../../hooks/useAuth';

const YOUTH_PROFILE_DRAFT_KEY = 'skidsYouthProfileDraft';

const getYouthProfileDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(YOUTH_PROFILE_DRAFT_KEY) || '{}');
  } catch {
    return {};
  }
};

const CreateAccountCredentials = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const youthProfile = getYouthProfileDraft();

      if (!youthProfile.firstName || !youthProfile.lastName) {
        throw new Error('Please complete your youth profile information first.');
      }

      await register({
        accountType: 'youth',
        role: 'user',
        email,
        password,
        firstName: youthProfile.firstName,
        middleName: youthProfile.middleName,
        lastName: youthProfile.lastName,
        suffix: youthProfile.suffix,
        barangay: youthProfile.barangay,
        youthProfile,
      });

      sessionStorage.removeItem(YOUTH_PROFILE_DRAFT_KEY);
      navigate('/account-created', {
        replace: true,
        state: { accountType: 'youth' },
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/youth-profile-form');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 flex items-start justify-center px-4 py-10 overflow-y-auto" style={{ height: '100vh', overflowY: 'auto' }}>
      <div className="w-full max-w-md my-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-blue-500 to-yellow-400"></div>

          {/* Back Button */}
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8 mt-2"
          >
            <IoArrowBackOutline className="w-4 h-4" />
            Back
          </button>

          {/* Header - Logo with SKIDS Text */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center justify-center">
              {/* Logo with Circle Background */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-blue-500/20 flex items-center justify-center shadow-lg shadow-yellow-500/20 border-2 border-yellow-400/30 p-2 mb-2">
                <img 
                  src={skidsLogo} 
                  alt="SKIDS Logo" 
                  className="w-14 h-14"
                />
              </div>
              
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-800 mb-1">New User</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              For your account to be created, we
              also require you to enter an email and
              a password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                placeholder="murillo@gmail.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                  required
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 pr-12"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Reminder Note */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200/50">
              <p className="text-sm text-yellow-800">
                Reminder: Do not forget your email and password.
              </p>
            </div>

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : 'Confirm'}
            </button>

            {/* Note */}
            <p className="text-center text-xs text-gray-400">
              Note: After confirming, you will be redirected to login with your credentials.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountCredentials;

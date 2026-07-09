import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth';
import skidsLogo from '../../assets/images/skids.svg';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please complete all required fields.');
      return;
    }

    if (!position) {
      setError('Please select a position.');
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
      await register({
        accountType: 'officer',
        role: 'admin',
        firstName,
        middleInitial,
        lastName,
        position,
        email,
        password,
      });
      setSuccess('Account created successfully. You may now log in.');
      setTimeout(() => {
        navigate('/account-created', {
          replace: true,
          state: { accountType: 'officer' },
        });
      }, 1500);
    } catch (registrationError) {
      setError(registrationError?.response?.data?.message || registrationError.message || 'Unable to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-blue-500 to-yellow-400"></div>

          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8 mt-2"
          >
            <IoArrowBackOutline className="w-4 h-4" />
            Back
          </button>

          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-3">
              {/* Logo with Circle Background */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-blue-500/20 flex items-center justify-center shadow-lg shadow-yellow-500/20 border-2 border-yellow-400/30 p-2">
                <img 
                  src={skidsLogo} 
                  alt="SKIDS Logo" 
                  className="w-14 h-14"
                />
              </div>
              {/* Divider */}
              <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-blue-500 rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Create New Account</h1>
            <p className="text-sm text-gray-500">
              Fill in your details to create your account.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Dela Cruz"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Juan"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">M.I.</label>
                <input
                  type="text"
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="A."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Position <span className="text-red-500">*</span>
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                required
              >
                <option value="">Select Position</option>
                <option value="SK Chairperson">SK Chairperson</option>
                <option value="SK Kagawad">SK Kagawad</option>
                <option value="SK Secretary">SK Secretary</option>
                <option value="SK Treasurer">SK Treasurer</option>
                <option value="SK Auditor">SK Auditor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                placeholder="you@email.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 pr-12"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 top-[2.4rem] flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <IoEyeOffOutline className="w-5 h-5" /> : <IoEyeOutline className="w-5 h-5" />}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create SK Officer Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/officer-login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

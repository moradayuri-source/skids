import { useLocation, useNavigate } from 'react-router-dom';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import skidsLogo from '../../assets/images/skids.svg';

const AccountCreated = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accountType = location.state?.accountType || 'officer';
  const isOfficer = accountType === 'officer';

  const handleGoToLogin = () => {
    navigate(isOfficer ? '/officer-login' : '/user-login');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-blue-500 to-yellow-400"></div>

          {/* Header with Logo */}
          <div className="text-center mb-8 mt-2">
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
          </div>

          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <IoCheckmarkCircleOutline className="w-12 h-12 text-green-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Account Created!</h1>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 leading-relaxed">
              Your {isOfficer ? 'SK Officer' : 'youth'} account has been successfully<br />
              registered. You can now log in.
            </p>
          </div>

          {/* Go to Login Button */}
          <button
            onClick={handleGoToLogin}
            className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to {isOfficer ? 'SK Officer' : 'User'} Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountCreated;

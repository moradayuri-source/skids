import { useNavigate } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import skidsLogo from '../../assets/images/skids.svg';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/youth-profile-form');
  };

  const handleCancel = () => {
    navigate('/user-login');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 flex items-start justify-center px-4 py-10 overflow-y-auto" style={{ height: '100vh', overflowY: 'auto' }}>
      <div className="w-full max-w-2xl my-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-400 via-blue-500 to-yellow-400"></div>

          {/* Back Button */}
          <button 
            onClick={handleCancel}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-8 mt-2"
          >
            <IoArrowBackOutline className="w-4 h-4" />
            Back
          </button>

          {/* Header with Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center gap-3">
              {/* Logo with Circle Background - Medium Size */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400/20 to-blue-500/20 flex items-center justify-center shadow-lg shadow-yellow-500/20 border-2 border-yellow-400/30 p-3">
                <img 
                  src={skidsLogo} 
                  alt="SKIDS Logo" 
                  className="w-20 h-20"
                />
              </div>
              {/* Divider */}
              <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-blue-500 rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Reminder!</h1>
          </div>

          {/* Content - Plain Text without Icons or Numbers */}
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p>
              Before you create an account, we want to let you know that you will be asked to provide some personal information, such as your <strong>name, email address, contact details, etc.</strong> This information will be used for filling the youth personal information record, account creation and to improve your experience within the system.
            </p>
            <p>
              We are committed to protecting your data and ensuring that your information is handled securely and responsibly. By continuing, you acknowledge that you understand what information will be collected and how it will be used.
            </p>
            <p>
              If you agree to proceed, click <strong>"Continue."</strong> If you do not wish to share your information, you may click <strong>"Cancel"</strong> to go back.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleContinue}
              className="flex-1 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-3.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Your privacy matters. Read our <span className="text-blue-500 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

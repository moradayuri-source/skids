import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import useAuth from '../../hooks/useAuth';

const roleHome = (role) => (role === 'admin' ? '/admin' : '/user');

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse) => {
    setError('');

    if (!credentialResponse.credential) {
      setError('Google did not return a credential. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      navigate(location.state?.from || roleHome(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100">
            <IoShieldCheckmarkOutline className="h-8 w-8 text-primary-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to SKIDS</h1>
          <p className="mt-2 text-sm text-gray-500">
            Use your Google account to access your SK dashboard.
          </p>
        </div>

        <Card className="p-6">
          {!googleClientId ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              VITE_GOOGLE_CLIENT_ID is missing. Add it to your frontend environment
              variables before using Google sign-in.
            </div>
          ) : (
            <div className={isSubmitting ? 'pointer-events-none opacity-60' : ''}>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed.')}
                text="continue_with"
                shape="rectangular"
                size="large"
                width="100%"
              />
            </div>
          )}

          {isSubmitting && (
            <p className="mt-4 text-center text-sm text-gray-500">Signing you in...</p>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;

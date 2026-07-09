import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your account email.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.auth.forgotPassword({ email });
      setMessage('If an account exists, a password reset link has been sent to your email.');
    } catch (forgotError) {
      setError(forgotError?.response?.data?.message || 'Unable to send reset instructions. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-[28px] bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
        <div className="bg-slate-950 text-white p-10">
          <p className="text-sm uppercase tracking-[0.22em] text-blue-300">Forgot Password</p>
          <h2 className="mt-4 text-3xl font-semibold">Reset your password</h2>
          <p className="mt-3 text-sm text-slate-300">Enter your email address and we'll send instructions to recover your account.</p>
        </div>

        <div className="p-8">
          {message && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-6">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-2"
                placeholder="officer@email.com"
                autoComplete="username"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base disabled:opacity-70"
            >
              {isSubmitting ? 'Sending reset link...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

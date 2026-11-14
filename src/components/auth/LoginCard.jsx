import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import { useAuth } from '../../hooks/useAuth';

const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" width="19" height="19" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const LoginCard = ({ type }) => {
  const isOfficer = type === 'officer';
  const title = isOfficer ? 'SK Officer Login' : 'Member Login';
  const { login } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const backButtonRef = useRef(null);
  const frontButtonRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCard = () => {
    setIsFlipped(true);
    requestAnimationFrame(() => backButtonRef.current?.focus({ preventScroll: true }));
  };

  const closeCard = () => {
    setIsFlipped(false);
    requestAnimationFrame(() => frontButtonRef.current?.focus({ preventScroll: true }));
  };

  const handlePointerEnter = (event) => {
    if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setIsFlipped(true);
    }
  };

  const handlePointerLeave = () => {
    // Keep the form visible while someone is typing or waiting for sign-in.
    if (!isSubmitting && !cardRef.current?.contains(document.activeElement)) {
      setIsFlipped(false);
    }
  };

  const handleBlur = (event) => {
    if (!isSubmitting && !event.currentTarget.contains(event.relatedTarget) && !event.currentTarget.matches(':hover')) {
      setIsFlipped(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(isOfficer ? { email, password } : { email, password, remember: rememberMe });
      const role = result.user?.role || result.role || (isOfficer ? 'admin' : 'user');
      navigate(['admin', 'manager'].includes(role) ? '/admin' : '/user', { replace: true });
    } catch (authError) {
      setError(authError?.response?.data?.message || authError.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article
      ref={cardRef}
      className={`login-card login-card--${type}${isFlipped ? ' login-card--flipped' : ''}`}
      aria-label={title}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlurCapture={handleBlur}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isFlipped && !isSubmitting) closeCard();
      }}
    >
      <div className="login-card__rotator">
        <div className="login-card__face login-card__front" inert={isFlipped} aria-hidden={isFlipped}>
          <span className="login-card__access-label">{isOfficer ? 'Lead & serve' : 'Connect & participate'}</span>
          <div className="login-card__icon">
            {isOfficer ? <IoShieldCheckmarkOutline aria-hidden="true" /> : <IoPersonOutline aria-hidden="true" />}
          </div>
          <h3>{title}</h3>
          <p className="login-card__description">
            {isOfficer
              ? 'Your space to lead, manage, and make a difference in our community.'
              : 'Stay informed, join activities, and be part of a growing youth community.'}
          </p>
          <div className="login-card__front-bottom">
            <p className="login-card__audience"><IoLockClosedOutline aria-hidden="true" /> {isOfficer ? 'Authorized SK officers only' : 'For registered youth members'}</p>
            <button
              ref={frontButtonRef}
              type="button"
              className="login-card__primary"
              onClick={openCard}
              aria-expanded={isFlipped}
              aria-controls={`${type}-login-panel`}
            >
              {isOfficer ? 'Enter as SK Officer' : 'Enter as Member'}
              <IoArrowForwardOutline aria-hidden="true" />
            </button>
            <span className="login-card__hint"><span className="login-card__hover-hint">Hover to sign in</span><span className="login-card__tap-hint">Tap to sign in</span></span>
          </div>
        </div>

        <div
          id={`${type}-login-panel`}
          className="login-card__face login-card__back"
          inert={!isFlipped}
          aria-hidden={!isFlipped}
        >
          <div className="login-card__back-heading">
            <div>
              <p className="login-card__access-label">Welcome back</p>
              <h3>{title}</h3>
            </div>
            <button
              ref={backButtonRef}
              type="button"
              className="login-card__back-button"
              onClick={closeCard}
              disabled={isSubmitting}
              aria-label={`Back to ${title} card`}
            ><IoArrowBackOutline aria-hidden="true" /></button>
          </div>

          <form className="login-card__form" onSubmit={handleSubmit} aria-label={`${title} form`}>
            <div className="login-card__field">
              <label htmlFor={`${type}-email`}>Email address</label>
              <input
                id={`${type}-email`}
                name="email"
                type="email"
                autoComplete="username"
                placeholder={isOfficer ? 'officer@email.com' : 'you@email.com'}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="login-card__field">
              <label htmlFor={`${type}-password`}>Password</label>
              <div className="login-card__password">
                <input
                  id={`${type}-password`}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >{showPassword ? <IoEyeOffOutline aria-hidden="true" /> : <IoEyeOutline aria-hidden="true" />}</button>
              </div>
            </div>
            <div className="login-card__options">
              {!isOfficer && <label><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>}
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            {error && <p className="login-card__error" role="alert">{error}</p>}
            <button type="submit" className="login-card__primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              {!isSubmitting && <IoArrowForwardOutline aria-hidden="true" />}
            </button>
          </form>

          <div className="login-card__divider"><span>or continue with</span></div>
          <Link className="login-card__google" to="/google-login"><GoogleLogo /> Continue with Google</Link>
          <p className="login-card__back-note">
            {isOfficer ? 'Use your authorized SK officer account.' : <>New to the community? <Link to="/terms">Create an account</Link></>}
          </p>
        </div>
      </div>
    </article>
  );
};

export default LoginCard;

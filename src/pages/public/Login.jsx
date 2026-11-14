import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoLocationOutline, IoPause, IoPlay } from 'react-icons/io5';
import LoginCard from '../../components/auth/LoginCard';
import './Login.css';

const communityPhotos = [
  '902205164_2185529672035193_6399143783342433023_n.jpg',
  '897806069_2178777329445478_9014726621012035878_n.jpg',
  '907163789_1439711838375636_5325704619649078872_n.jpg',
  '906071085_1291957216425548_5059300307660796894_n.jpg',
  '895978864_1836465771018376_4623292261431851377_n.jpg',
];

const Login = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className={`login-page${isPaused ? ' login-page--paused' : ''}`}>
      <div className="login-background" aria-hidden="true">
        {communityPhotos.map((photo, index) => (
          <div
            key={photo}
            className="login-background__slide"
            style={{
              backgroundImage: `url('/${photo}')`,
              '--slide-index': index,
            }}
          />
        ))}
      </div>

      <main className="login-main">
        <header className="login-brand">
          <img
            className="login-brand__logo"
            src="/sk.jpg"
            alt="Sangguniang Kabataan logo"
            width="88"
            height="88"
          />
          <h1><span>SK</span>IDS</h1>
          <p>Sangguniang Kabataan Information Dissemination System</p>
        </header>

        <section className="login-access" aria-labelledby="access-heading">
          <div className="login-access__intro">
            <p className="login-eyebrow">Connected youth. Stronger community.</p>
            <h2 id="access-heading">Select your access type to continue</h2>
          </div>
          <div className="login-cards">
            <LoginCard type="member" />
            <LoginCard type="officer" />
          </div>
        </section>

        <div className="login-scene-caption">
          <span><IoLocationOutline aria-hidden="true" /> Barangay Masaguisi</span>
          <button
            type="button"
            className="login-motion-toggle"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={isPaused ? 'Play background slideshow' : 'Pause background slideshow'}
            aria-pressed={isPaused}
          >
            {isPaused ? <IoPlay aria-hidden="true" /> : <IoPause aria-hidden="true" />}
            <span>{isPaused ? 'Play background' : 'Pause background'}</span>
          </button>
        </div>
      </main>

      <footer className="login-footer">
        <div className="login-footer__inner">
          <div className="login-footer__brand">
            <span className="login-footer__wordmark"><span>SK</span>IDS</span>
            <p>For the youth. For our community.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link to="/terms">Terms &amp; conditions</Link>
            <Link to="/terms">Create an account <span aria-hidden="true">↗</span></Link>
          </nav>
          <p className="login-footer__copyright">© {new Date().getFullYear()} SKIDS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;

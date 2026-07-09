import { useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

const Login = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col items-center justify-center">
        <header className="mb-12 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl md:h-28 md:w-28">
            <span className="text-4xl font-bold tracking-tight text-yellow-400 md:text-5xl">
              SK
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-yellow-400">SK</span>
            <span className="text-blue-50">IDS</span>
          </h1>
          <p className="mt-1 text-sm text-blue-100/75 md:text-base">
            Sangguniang Kabataan Information Dissemination System
          </p>
        </header>

        <h2 className="mb-10 text-center text-xl font-semibold">
          Select your access type to continue
        </h2>

        <section className="grid w-full max-w-4xl grid-cols-1 gap-7 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/user-login')}
            className="group rounded-2xl border border-gray-200 bg-white p-9 text-center text-gray-800 shadow-lg transition-all duration-300 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-950/20"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 transition-colors group-hover:bg-blue-100">
              <IoPersonOutline className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">User Login</h3>
            <p className="mx-auto mt-3 min-h-[3rem] max-w-xs text-sm leading-6 text-gray-500">
              For registered youth members. Sign in with your Google account.
            </p>
            <span className="mt-6 block w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-colors group-hover:bg-blue-700">
              Enter as User
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/officer-login')}
            className="group rounded-2xl border border-gray-200 bg-white p-9 text-center text-gray-800 shadow-lg transition-all duration-300 hover:border-yellow-400/60 hover:shadow-2xl hover:shadow-blue-950/20"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 transition-colors group-hover:bg-yellow-100">
              <IoShieldCheckmarkOutline className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold">SK Officer Login</h3>
            <p className="mx-auto mt-3 min-h-[3rem] max-w-xs text-sm leading-6 text-gray-500">
              For authorized Sangguniang Kabataan officers only.
            </p>
            <span className="mt-6 block w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-yellow-500/30 transition-colors group-hover:bg-yellow-500">
              Enter as SK Officer
            </span>
          </button>
        </section>

        <footer className="mt-12 w-full max-w-5xl border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-blue-100/60">
            (c) 2026 SKIDS - Sangguniang Kabataan Information Dissemination System
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Login;

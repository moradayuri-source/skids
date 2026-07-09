import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../services/api';

const TOKEN_KEY = 'authToken';
const AuthContext = createContext(null);

const DEMO_ACCOUNTS = {
  'admin@skids.test': {
    email: 'admin@skids.test',
    password: 'admin123',
    role: 'admin',
    name: 'Admin Demo',
  },
  'user@skids.test': {
    email: 'user@skids.test',
    password: 'youth123',
    role: 'user',
    name: 'Youth Demo',
  },
};

const getDemoUser = (email, password) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const account = DEMO_ACCOUNTS[normalizedEmail];

  if (!account || String(password || '') !== account.password) {
    return null;
  }

  return {
    id: account.role === 'admin' ? 'demo-admin' : 'demo-user',
    email: account.email,
    role: account.role,
    name: account.name,
  };
};

const getDemoUserFromToken = (token) => {
  if (token === 'demo-token-admin') {
    return {
      id: 'demo-admin',
      email: 'admin@skids.test',
      role: 'admin',
      name: 'Admin Demo',
    };
  }

  if (token === 'demo-token-user') {
    return {
      id: 'demo-user',
      email: 'user@skids.test',
      role: 'user',
      name: 'Youth Demo',
    };
  }

  return null;
};

const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

const storeToken = (token, remember = true) => {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);

  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  sessionStorage.setItem(TOKEN_KEY, token);
};

const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return undefined;
    }

    const demoUser = getDemoUserFromToken(token);
    if (demoUser) {
      setUser(demoUser);
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await api.auth.me();
        if (isMounted) {
          setUser(response.data.user);
        }
      } catch {
        clearStoredToken();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const response = await api.auth.google(credential);
    storeToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const login = useCallback(async ({ email, password, remember = true }) => {
    const demoUser = getDemoUser(email, password);

    if (demoUser) {
      const token = demoUser.role === 'admin' ? 'demo-token-admin' : 'demo-token-user';
      storeToken(token, remember);
      setUser(demoUser);
      return { token, user: demoUser };
    }

    const response = await api.auth.login({ email, password });
    storeToken(response.data.token, remember);
    setUser(response.data.user);
    return response.data;
  }, []);

  const register = useCallback(async (data) => {
    const response = await api.auth.register(data);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Token cleanup should happen even if the server is unavailable.
    } finally {
      clearStoredToken();
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(
    async (data) => {
      const response =
        user?.role === 'admin'
          ? await api.admin.updateProfile(data)
          : await api.user.updateProfile(data);
      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      return updatedUser;
    },
    [user?.role]
  );

  const changePassword = useCallback(async () => {
    throw new Error('Password changes are not available yet.');
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
      updateProfile,
      changePassword,
      updateUser: setUser,
      isAdmin: user?.role === 'admin',
      isYouth: user?.role === 'user',
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, loginWithGoogle, register, logout, updateProfile, changePassword]
  );

  return createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

export default useAuth;

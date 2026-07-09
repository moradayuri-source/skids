import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
import Landing from '../pages/public/Login';
import GoogleLogin from '../pages/auth/Login';
import UserLogin from '../pages/public/UserLogin';
import OfficerLogin from '../pages/public/OfficerLogin';
import ForgotPassword from '../pages/public/ForgotPassword';
import TermsAndCondition from '../pages/public/TermsAndCondition';
import Register from '../pages/public/Register';
import CreateAccountCredentials from '../pages/public/CreateAccountCredentials';
import AccountCreated from '../pages/public/AccountCreated';
import YouthProfileForm from '../pages/public/YouthProfileForm';
import useAuth from '../hooks/useAuth';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import YouthManagement from '../pages/admin/YouthManagement';
import AdminAnnouncements from '../pages/admin/AdminAnnouncements';
import AdminEvents from '../pages/admin/AdminEvents';
import BudgetManagement from '../pages/admin/BudgetManagement';
import DocumentManagement from '../pages/admin/DocumentManagement';
import Messages from '../pages/admin/Messages';
import HistoryLog from '../pages/admin/HistoryLog';
import AdminProfile from '../pages/admin/AdminProfile';

// User Pages
import UserDashboard from '../pages/user/UserDashboard';
import Announcements from '../pages/user/Announcements';
import EventsCalendar from '../pages/user/EventsCalendar';
import BudgetTransparency from '../pages/user/BudgetTransparency';
import Documents from '../pages/user/Documents';
import UserMessages from '../pages/user/UserMessages';
import UserProfile from '../pages/user/UserProfile';

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="mx-auto h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
      <p className="mt-4 text-sm font-medium text-gray-600">Loading SKIDS...</p>
    </div>
  </div>
);

const roleHome = (role) => (role === 'admin' ? '/admin' : '/user');

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestRoute>
            <Landing />
          </GuestRoute>
        }
      />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Landing />
          </GuestRoute>
        }
      />
      <Route
        path="/google-login"
        element={
          <GuestRoute>
            <GoogleLogin />
          </GuestRoute>
        }
      />
      <Route
        path="/user-login"
        element={
          <GuestRoute>
            <UserLogin />
          </GuestRoute>
        }
      />
      <Route
        path="/officer-login"
        element={
          <GuestRoute>
            <OfficerLogin />
          </GuestRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/terms" element={<TermsAndCondition />} />
      <Route path="/register" element={<Register />} />
      <Route path="/create-account" element={<CreateAccountCredentials />} />
      <Route path="/create-credentials" element={<Navigate to="/create-account" replace />} />
      <Route path="/account-created" element={<AccountCreated />} />
      <Route path="/youth-profile-form" element={<YouthProfileForm />} />
      <Route path="/youth-profile" element={<Navigate to="/youth-profile-form" replace />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="youth" element={<YouthManagement />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="budget" element={<BudgetManagement />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="messages" element={<Messages />} />
        <Route path="history" element={<HistoryLog />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="events" element={<EventsCalendar />} />
        <Route path="budget" element={<BudgetTransparency />} />
        <Route path="documents" element={<Documents />} />
        <Route path="messages" element={<UserMessages />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

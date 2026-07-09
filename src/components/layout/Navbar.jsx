import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IoMenu, 
  IoClose, 
  IoNotificationsOutline, 
  IoPersonCircleOutline,
  IoSettingsOutline,
  IoLogOutOutline
} from 'react-icons/io5';
import useAuth from '../../hooks/useAuth';
import { api } from '../../services/api';

const Navbar = ({ 
  title = 'SKIDS', 
  userRole = 'Admin',
  userName = 'SK Chairwoman',
  onToggleSidebar,
  isSidebarOpen,
  role = 'admin'
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const currentRole = user?.role || role;
  const displayName = user?.name || userName;
  const isManagementRole = ['admin', 'manager'].includes(currentRole);
  const displayRole =
    user?.role === 'admin' ? 'Chairperson' : user?.role === 'manager' ? 'Manager' : userRole;
  const profilePath = isManagementRole ? '/admin/profile' : '/user/profile';
  const announcementsPath =
    isManagementRole ? '/admin/announcements' : '/user/announcements';

  const handleNotifications = async () => {
    const willOpen = !isNotificationsOpen;
    setIsNotificationsOpen(willOpen);
    setIsDropdownOpen(false);

    if (!willOpen) return;

    setNotificationsLoading(true);
    try {
      const response =
        isManagementRole
          ? await api.admin.getAnnouncements()
          : await api.user.getAnnouncements();
      setNotifications(response.data.slice(0, 5));
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden"
          >
            {isSidebarOpen ? (
              <IoClose className="w-6 h-6 text-gray-600" />
            ) : (
              <IoMenu className="w-6 h-6 text-gray-600" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <img src="/sk.jpg" alt="" className="h-8 w-8 rounded-lg object-cover lg:hidden" />
            <h1 className="text-lg font-bold tracking-tight text-slate-900">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              aria-label="Open notifications"
              aria-expanded={isNotificationsOpen}
              onClick={handleNotifications}
              className={`relative rounded-xl p-2 transition-colors duration-200 ${
                isNotificationsOpen ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <IoNotificationsOutline className="w-6 h-6" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <p className="font-semibold text-gray-900">Notifications</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      navigate(announcementsPath);
                    }}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    View all
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificationsLoading ? (
                    <p className="px-4 py-6 text-center text-sm text-gray-500">Loading…</p>
                  ) : notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-gray-500">
                      No announcements yet.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          navigate(announcementsPath);
                        }}
                        className="block w-full border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50"
                      >
                        <p className="truncate text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {notification.content}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition-colors duration-200 hover:bg-slate-100"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <IoPersonCircleOutline className="h-8 w-8 text-slate-500" />
              )}
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {displayName}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{displayRole}</p>
                </div>
                <Link
                  to={profilePath}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <IoSettingsOutline className="w-4 h-4" />
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full"
                >
                  <IoLogOutOutline className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

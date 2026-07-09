import { NavLink, useNavigate } from 'react-router-dom';
import {
  IoHomeOutline,
  IoPeopleOutline,
  IoMegaphoneOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoChatbubbleOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoLogOutOutline
} from 'react-icons/io5';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose, role = 'admin' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const adminMenuItems = [
    { path: '/admin', icon: IoHomeOutline, label: 'Dashboard' },
    { path: '/admin/youth', icon: IoPeopleOutline, label: 'Youth Management' },
    { path: '/admin/announcements', icon: IoMegaphoneOutline, label: 'Announcements' },
    { path: '/admin/events', icon: IoCalendarOutline, label: 'Events' },
    { path: '/admin/budget', icon: IoWalletOutline, label: 'Budget' },
    { path: '/admin/documents', icon: IoDocumentTextOutline, label: 'Documents' },
    { path: '/admin/messages', icon: IoChatbubbleOutline, label: 'Messages' },
    { path: '/admin/history', icon: IoTimeOutline, label: 'Activity Logs' },
    ...(user?.role === 'admin'
      ? [{ path: '/admin/managers', icon: IoShieldCheckmarkOutline, label: 'Manager Accounts' }]
      : []),
    { path: '/admin/profile', icon: IoPersonOutline, label: 'Profile' },
  ];

  const userMenuItems = [
    { path: '/user', icon: IoHomeOutline, label: 'Dashboard' },
    { path: '/user/announcements', icon: IoMegaphoneOutline, label: 'Announcements' },
    { path: '/user/events', icon: IoCalendarOutline, label: 'Events' },
    { path: '/user/budget', icon: IoWalletOutline, label: 'Budget' },
    { path: '/user/documents', icon: IoDocumentTextOutline, label: 'Documents' },
    { path: '/user/messages', icon: IoChatbubbleOutline, label: 'Messages' },
    { path: '/user/profile', icon: IoPersonOutline, label: 'Profile' },
  ];

  const menuItems = role === 'admin' ? adminMenuItems : userMenuItems;
  const profilePath = role === 'admin' ? '/admin/profile' : '/user/profile';
  const roleLabel =
    user?.role === 'admin' ? 'SK Chairperson' : user?.role === 'manager' ? 'SK Manager' : 'Youth Member';
  const initials = String(user?.name || 'SK')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[60] h-full overflow-hidden border-r border-blue-700/30
          bg-gradient-to-b from-[#1559e8] via-[#173fbb] to-[#171b68] text-white shadow-2xl shadow-blue-950/20
          transition-transform duration-300 ease-in-out
          w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:top-0 lg:z-40 lg:h-screen lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
            <img src="/sk.jpg" alt="" className="h-10 w-10 rounded-xl bg-white object-cover ring-2 ring-white/20" />
            <div>
              <h1 className="text-lg font-extrabold tracking-wide text-white">SKIDS</h1>
              <p className="text-[10px] font-medium text-blue-100">Information Dissemination</p>
            </div>
          </div>

          <NavLink
            to={profilePath}
            onClick={() => onClose?.()}
            className="mx-3 mt-4 flex items-center gap-3 rounded-xl bg-white/10 p-3 ring-1 ring-white/10 transition hover:bg-white/20"
            aria-label="Open account profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-xs font-extrabold text-blue-950">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">{roleLabel}</p>
              <p className="truncate text-sm font-semibold text-white">{user?.name || 'SKIDS Member'}</p>
            </div>
          </NavLink>

          <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/user'}
                className={({ isActive }) => `
                  flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }
                `}
                onClick={() => onClose && onClose()}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-blue-50 transition hover:bg-white/20 hover:text-white"
            >
              <IoLogOutOutline className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

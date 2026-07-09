import { NavLink } from 'react-router-dom';
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
  IoShieldCheckmarkOutline
} from 'react-icons/io5';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isOpen, onClose, role = 'admin' }) => {
  const { user } = useAuth();
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
          fixed inset-y-0 left-0 z-[60] h-full bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
          w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:top-16 lg:z-40 lg:h-[calc(100vh-4rem)] lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 lg:hidden">
            <h1 className="text-xl font-bold text-primary-600">SKIDS</h1>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/user'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => onClose && onClose()}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">SK</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">SK Masagui</p>
                <p className="text-xs text-gray-500 truncate">Sangguniang Kabataan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

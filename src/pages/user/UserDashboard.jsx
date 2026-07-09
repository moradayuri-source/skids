import { useEffect, useState } from 'react';
import {
  IoCalendarOutline,
  IoChatbubbleOutline,
  IoDocumentTextOutline,
  IoMegaphoneOutline,
  IoWalletOutline,
} from 'react-icons/io5';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import { SkeletonCard, SkeletonList } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const quickLinks = [
  { to: '/user/announcements', label: 'Announcements', icon: IoMegaphoneOutline, color: 'text-primary-600' },
  { to: '/user/events', label: 'Events', icon: IoCalendarOutline, color: 'text-green-600' },
  { to: '/user/budget', label: 'Budget', icon: IoWalletOutline, color: 'text-yellow-600' },
  { to: '/user/documents', label: 'Documents', icon: IoDocumentTextOutline, color: 'text-purple-600' },
  { to: '/user/messages', label: 'Messages', icon: IoChatbubbleOutline, color: 'text-blue-600' },
];

const UserDashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [budgetReports, setBudgetReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.user.getAnnouncements(), api.user.getEvents(), api.user.getBudget()])
      .then(([announcementResponse, eventResponse, budgetResponse]) => {
        if (!active) return;
        setAnnouncements(announcementResponse.data.slice(0, 3));
        setEvents(eventResponse.data.slice(0, 3));
        setBudgetReports(budgetResponse.data.slice(0, 3));
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || 'Unable to load dashboard data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to SKIDS!</h1>
        <p className="text-gray-500 mt-1">Stay updated with the latest SK announcements, events, and information.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {quickLinks.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}>
            <Card className="h-full p-4 text-center hover:shadow-md transition-shadow">
              <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
              <p className="text-sm font-medium text-gray-700">{label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonList rows={2} />
          <SkeletonList rows={2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Latest Announcements" className="p-6">
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No announcements available.</p>
              ) : announcements.map((announcement) => (
                <div key={announcement.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {announcement.publishedAt
                      ? new Date(announcement.publishedAt).toLocaleDateString()
                      : ''}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Upcoming Events" className="p-6">
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming events.</p>
              ) : events.map((event) => (
                <div key={event.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600">{String(event.date).slice(0, 10)} • {event.time}</p>
                  <p className="text-xs text-gray-400">{event.location}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="mt-6">
        <Card title="Budget Transparency" className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {budgetReports.length === 0 ? (
                <p className="text-gray-500 text-center sm:col-span-3 py-4">No budget reports available.</p>
              ) : budgetReports.map((report) => (
                <div key={report.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">{report.title}</p>
                  <p className="text-lg font-bold text-primary-600">{report.amount}</p>
                  <p className="text-xs text-gray-500">{report.category}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;

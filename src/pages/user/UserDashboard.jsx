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
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Welcome to SKIDS!</h1>
        <p className="page-subtitle">Stay updated with the latest SK announcements, events, and information.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {quickLinks.map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}>
            <Card className="group h-full p-5 text-center transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 transition group-hover:bg-primary-50">
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <p className="text-xs font-semibold text-slate-700">{label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonList rows={2} />
          <SkeletonList rows={2} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Latest Announcements" icon={IoMegaphoneOutline} className="p-5 sm:p-6">
            <div className="divide-y divide-slate-100">
              {announcements.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No announcements available.</p>
              ) : announcements.map((announcement) => (
                <div key={announcement.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-slate-900">{announcement.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{announcement.content}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {announcement.publishedAt
                      ? new Date(announcement.publishedAt).toLocaleDateString()
                      : ''}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Upcoming Events" icon={IoCalendarOutline} className="p-5 sm:p-6">
            <div className="divide-y divide-slate-100">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming events.</p>
              ) : events.map((event) => (
                <div key={event.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                  <p className="text-sm text-gray-600">{String(event.date).slice(0, 10)} • {event.time}</p>
                  <p className="mt-1 text-xs text-slate-400">{event.location}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div>
        <Card title="Budget Transparency" icon={IoWalletOutline} className="p-5 sm:p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {budgetReports.length === 0 ? (
                <p className="text-gray-500 text-center sm:col-span-3 py-4">No budget reports available.</p>
              ) : budgetReports.map((report) => (
                <div key={report.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                  <p className="mt-1 text-lg font-bold text-primary-600">{report.amount}</p>
                  <p className="mt-1 text-xs text-slate-500">{report.category}</p>
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

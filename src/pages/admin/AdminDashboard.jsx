import { useState, useEffect } from 'react';
import {
  IoPeopleOutline,
  IoMegaphoneOutline, 
  IoCalendarOutline, 
  IoChatbubbleOutline,
  IoTimeOutline
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import { SkeletonCard, SkeletonList } from '../../components/common/Skeleton';
import useAuth from '../../hooks/useAuth';
import { api } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalYouth: 0,
    totalAnnouncements: 0,
    totalEvents: 0,
    totalMessages: 0,
    unreadMessages: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [youth, announcements, events, messages, history] = await Promise.all([
          api.admin.getYouth(),
          api.admin.getAnnouncements(),
          api.admin.getEvents(),
          api.admin.getMessages(),
          api.admin.getHistory({ limit: 5 }),
        ]);
        if (!active) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setStats({
          totalYouth: youth.data.length,
          totalAnnouncements: announcements.data.length,
          totalEvents: events.data.filter((event) => new Date(event.date) >= today).length,
          totalMessages: messages.data.length,
          unreadMessages: messages.data.filter((message) => message.status === 'unread').length,
        });
        setActivities(history.data.logs || []);
      } catch (loadError) {
        if (active) {
          setError(loadError.response?.data?.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1763ed] via-[#2455df] to-[#3532a4] px-6 py-7 text-white shadow-lg shadow-blue-900/15 sm:px-8">
        <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100">Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Welcome back, {user?.name?.split(' ')[0] || 'Chairperson'}!
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Sangguniang Kabataan Information Dissemination System
          </p>
        </div>
      </div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Youth Members"
            value={stats.totalYouth}
            icon={IoPeopleOutline}
            color="primary"
          />
          <StatCard
            title="Announcements"
            value={stats.totalAnnouncements}
            icon={IoMegaphoneOutline}
            color="green"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.totalEvents}
            icon={IoCalendarOutline}
            color="yellow"
          />
          <StatCard
            title="Messages"
            value={stats.totalMessages}
            icon={IoChatbubbleOutline}
            color="purple"
            subtitle={`${stats.unreadMessages} unread`}
          />
        </div>
      )}

      {/* Recent Activity */}
      <Card
        title="Recent Activity"
        subtitle="Latest changes made across the SKIDS workspace."
        icon={IoTimeOutline}
        className="p-5 sm:p-6"
      >
        {loading ? (
          <SkeletonList rows={4} />
        ) : (
          <div className="divide-y divide-slate-100">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <div className="rounded-lg bg-primary-50 p-2">
                <IoTimeOutline className="h-4 w-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-800">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-sm text-slate-500">{activity.details}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(activity.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {!activities.length && (
            <p className="py-8 text-center text-sm text-slate-500">No recent activity yet.</p>
          )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;

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
import { getDashboardStats } from '../../utils/mockData';

// Placeholder for future API call
// import { getDashboardStats } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalYouth: 0,
    totalAnnouncements: 0,
    totalEvents: 0,
    totalMessages: 0,
    unreadMessages: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Future API call: fetchDashboardStats()
    // axios.get('/api/admin/dashboard/stats')
    //   .then(response => setStats(response.data))
    //   .catch(error => console.error('Error fetching stats:', error));

    // Using mock data for now
    const dashboardStats = getDashboardStats();
    setStats({
      totalYouth: dashboardStats.totalYouth,
      totalAnnouncements: dashboardStats.totalAnnouncements,
      totalEvents: dashboardStats.totalEvents,
      totalMessages: dashboardStats.totalMessages,
      unreadMessages: dashboardStats.unreadMessages
    });
    setActivities(dashboardStats.recentActivities);
    setLoading(false);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, SK Chairwoman! Here's what's happening with your SKIDS.</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <Card title="Recent Activity" className="p-6">
        {loading ? (
          <SkeletonList rows={4} />
        ) : (
          <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="p-2 bg-gray-100 rounded-lg">
                <IoTimeOutline className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span> {activity.action}
                </p>
                <p className="text-sm text-gray-500">{activity.details}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
              </div>
            </div>
          ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;

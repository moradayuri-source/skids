import { useState, useEffect } from 'react';
import { 
  IoMegaphoneOutline, 
  IoCalendarOutline, 
  IoWalletOutline,
  IoDocumentTextOutline,
  IoChatbubbleOutline
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import { SkeletonCard, SkeletonList } from '../../components/common/Skeleton';
import { getAnnouncements, getEvents, getBudgetReports } from '../../utils/mockData';

const UserDashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [budgetReports, setBudgetReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Future API calls
    // axios.get('/api/announcements').then(res => setAnnouncements(res.data.slice(0, 3)));
    // axios.get('/api/events').then(res => setEvents(res.data.slice(0, 3)));
    // axios.get('/api/budget').then(res => setBudgetReports(res.data.slice(0, 3)));

    setAnnouncements(getAnnouncements().slice(0, 3));
    setEvents(getEvents().slice(0, 3));
    setBudgetReports(getBudgetReports().slice(0, 3));
    setLoading(false);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to SKIDS!</h1>
        <p className="text-gray-500 mt-1">Stay updated with the latest SK announcements, events, and information.</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <IoMegaphoneOutline className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Announcements</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <IoCalendarOutline className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Events</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <IoWalletOutline className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Budget</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <IoDocumentTextOutline className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Documents</p>
        </Card>
        <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
          <IoChatbubbleOutline className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Messages</p>
        </Card>
      </div>

      {/* Announcements & Events */}
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
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{announcement.date}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Upcoming Events" className="p-6">
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming events.</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600">{event.date} • {event.time}</p>
                  <p className="text-xs text-gray-400">{event.location}</p>
                </div>
              ))
            )}
          </div>
        </Card>
        </div>
      )}

      {/* Budget Summary */}
      <div className="mt-6">
        <Card title="Budget Transparency" className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {budgetReports.length === 0 ? (
              <p className="text-gray-500 text-center col-span-3 py-4">No budget reports available.</p>
            ) : (
              budgetReports.map((report) => (
                <div key={report.id} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">{report.title}</p>
                  <p className="text-lg font-bold text-primary-600">{report.amount}</p>
                  <p className="text-xs text-gray-500">{report.category}</p>
                </div>
              ))
            )}
          </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;

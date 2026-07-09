import { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import { SkeletonList } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.user
      .getAnnouncements()
      .then((response) => {
        if (active) setAnnouncements(response.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || 'Unable to load announcements.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const priorityColor = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 mt-1">Stay informed with official SK announcements and updates.</p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <SkeletonList rows={3} />
        ) : announcements.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No announcements available.</p>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{announcement.content}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor[announcement.priority] || 'bg-gray-100 text-gray-700'}`}>
                  {announcement.priority}
                </span>
                <span className="text-xs text-gray-400">
                  {announcement.publishedAt
                    ? new Date(announcement.publishedAt).toLocaleDateString()
                    : ''}
                </span>
                <span className="text-xs text-gray-400">• By {announcement.authorName}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;

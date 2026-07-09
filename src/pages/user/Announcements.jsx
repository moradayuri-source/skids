import { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import { SkeletonList } from '../../components/common/Skeleton';
import { getAnnouncements } from '../../utils/mockData';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Future API call: fetchAnnouncements()
    // axios.get('/api/announcements')
    //   .then(response => setAnnouncements(response.data))
    //   .catch(error => console.error('Error fetching announcements:', error));

    setAnnouncements(getAnnouncements());
    setLoading(false);
  }, []);

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-green-100 text-green-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 mt-1">Stay informed with official SK announcements and updates.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <SkeletonList rows={3} />
        ) : announcements.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No announcements available.</p>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{announcement.content}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    <span className="text-xs text-gray-400">{announcement.date}</span>
                    <span className="text-xs text-gray-400">• By {announcement.author}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;

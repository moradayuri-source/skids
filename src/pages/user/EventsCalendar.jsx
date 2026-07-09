import { useState, useEffect } from 'react';
import { IoLocationOutline, IoTimeOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import { SkeletonList } from '../../components/common/Skeleton';
import { getEvents } from '../../utils/mockData';

const EventsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Future API call: fetchEvents()
    // axios.get('/api/events')
    //   .then(response => setEvents(response.data))
    //   .catch(error => console.error('Error fetching events:', error));

    setEvents(getEvents());
    setLoading(false);
  }, []);

  // Simple month/year navigation
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events Calendar</h1>
        <p className="text-gray-500 mt-1">View upcoming SK events and activities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100">
              ←
            </button>
            <h2 className="text-lg font-semibold">{months[selectedMonth]} {selectedYear}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100">
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
            {/* Simplified calendar - just showing a sample */}
            {Array.from({ length: 28 }, (_, i) => (
              <div
                key={i}
                className={`py-2 text-sm rounded-lg hover:bg-gray-100 cursor-pointer ${
                  i === 15 ? 'bg-primary-100 text-primary-700 font-semibold' : ''
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </Card>

        {/* Events List */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          {loading ? (
            <SkeletonList rows={3} />
          ) : (
            <div className="space-y-4">
              {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming events scheduled.</p>
              ) : (
                events.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 text-center">
                    <div className="bg-primary-100 rounded-lg px-3 py-1">
                      <p className="text-xs text-primary-600 font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-xl font-bold text-primary-700">
                        {new Date(event.date).getDate()}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <IoTimeOutline className="w-4 h-4" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <IoLocationOutline className="w-4 h-4" />
                        {event.location}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  </div>
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

export default EventsCalendar;

import { useEffect, useState } from 'react';
import {
  IoChevronBack,
  IoChevronForward,
  IoLocationOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import { SkeletonList } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const dateKey = (value) => String(value || '').slice(0, 10);

const localDateKey = (date) => {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const EventsCalendar = () => {
  const now = new Date();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    let active = true;
    api.user
      .getEvents()
      .then((response) => {
        if (active) setEvents(response.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || 'Unable to load events.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((year) => year - 1);
    } else {
      setSelectedMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((year) => year + 1);
    } else {
      setSelectedMonth((month) => month + 1);
    }
  };

  const today = localDateKey(new Date());
  const eventDates = new Set(events.map((event) => dateKey(event.date)));
  const firstWeekday = new Date(selectedYear, selectedMonth, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const upcomingEvents = events.filter((event) => dateKey(event.date) >= today);

  return (
    <div>
      <div className="mb-6">
        <p className="mb-1 text-xs font-medium text-slate-400">Dashboard / Calendar</p>
        <h1 className="page-title">Event Calendar</h1>
        <p className="page-subtitle">View upcoming SK events and activities.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.65fr)]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button type="button" aria-label="Previous month" onClick={prevMonth} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <IoChevronBack className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">{months[selectedMonth]} {selectedYear}</h2>
            <button type="button" aria-label="Next month" onClick={nextMonth} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <IoChevronForward className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="py-1 text-xs font-medium text-gray-500">{day}</div>
            ))}

            {calendarCells.map((day, index) => {
              if (!day) return <div key={`blank-${index}`} aria-hidden="true" />;

              const cellDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = cellDate === today;
              const hasEvent = eventDates.has(cellDate);

              return (
                <div
                  key={cellDate}
                  className={`relative flex min-h-12 items-center justify-center rounded-xl border py-2 text-sm sm:min-h-16 ${
                    hasEvent ? 'border-sky-200 bg-sky-100 text-sky-800' : 'border-slate-100 text-slate-700 hover:bg-slate-50'
                  } ${isToday ? 'font-extrabold ring-2 ring-primary-500 ring-offset-1' : ''}`}
                  title={hasEvent ? 'Upcoming event' : undefined}
                >
                  {day}
                  {hasEvent && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sky-600" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="mb-1 text-base font-semibold text-slate-900">Upcoming Events</h3>
          <p className="mb-4 text-xs text-slate-500">All scheduled events from today onward.</p>
          {loading ? (
            <SkeletonList rows={3} />
          ) : upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming events scheduled.</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const eventDate = new Date(`${dateKey(event.date)}T00:00:00`);
                return (
                  <div key={event.id} className="flex items-start gap-4 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="rounded-lg bg-sky-100 px-3 py-1">
                        <p className="text-xs font-medium text-sky-700">
                          {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-xl font-bold text-sky-800">{eventDate.getDate()}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <IoTimeOutline className="w-4 h-4" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <IoLocationOutline className="w-4 h-4" />
                          {event.location}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EventsCalendar;

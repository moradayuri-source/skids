import { useState, useEffect } from 'react';
import {
  IoAddOutline,
  IoChevronBack,
  IoChevronForward,
  IoLocationOutline,
  IoPencilOutline,
  IoTimeOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const todayDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const AdminEvents = () => {
  const now = new Date();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    let active = true;
    api.admin
      .getEvents()
      .then((response) => {
        if (active) {
          setEvents(
            response.data.map((event) => ({ ...event, date: String(event.date).slice(0, 10) }))
          );
        }
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

  const handleAdd = () => {
    setSelectedEvent(null);
    setFormData({ title: '', date: '', time: '', location: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.admin.deleteEvent(id);
        setEvents((current) => current.filter((event) => event.id !== id));
      } catch (deleteError) {
        setError(deleteError.response?.data?.message || 'Unable to delete event.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      setError('Complete all required event fields.');
      return;
    }
    if (formData.date < todayDate()) {
      setError('Events cannot be scheduled in the past.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        status: formData.status || 'Scheduled',
      };
      const response = selectedEvent
        ? await api.admin.updateEvent(selectedEvent.id, payload)
        : await api.admin.addEvent(payload);
      const saved = { ...response.data, date: String(response.data.date).slice(0, 10) };
      setEvents((current) =>
        selectedEvent
          ? current.map((event) => (event.id === selectedEvent.id ? saved : event))
          : [...current, saved].sort((a, b) => a.date.localeCompare(b.date))
      );
      setIsModalOpen(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const firstWeekday = new Date(selectedYear, selectedMonth, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const eventDates = new Set(events.map((event) => String(event.date).slice(0, 10)));
  const upcomingEvents = events.filter((event) => event.date >= todayDate());

  const changeMonth = (direction) => {
    const next = new Date(selectedYear, selectedMonth + direction, 1);
    setSelectedMonth(next.getMonth());
    setSelectedYear(next.getFullYear());
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Event Schedule</h1>
          <p className="page-subtitle">Create and manage official barangay events for the admin and officer side.</p>
        </div>
        <Button onClick={handleAdd} icon={IoAddOutline}>
          Add Event
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-slate-900">Calendar View</h2>
            <p className="mt-0.5 text-xs text-slate-500">Event dates are highlighted in light blue.</p>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <IoChevronBack className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-800">{months[selectedMonth]} {selectedYear}</h3>
            <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <IoChevronForward className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">{day}</div>
            ))}
            {calendarCells.map((day, index) => {
              if (!day) return <div key={`blank-${index}`} aria-hidden="true" />;
              const cellDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasEvent = eventDates.has(cellDate);
              const isToday = cellDate === todayDate();
              return (
                <div
                  key={cellDate}
                  className={`relative flex min-h-12 items-center justify-center rounded-xl border text-sm transition sm:min-h-16 ${
                    hasEvent
                      ? 'border-sky-200 bg-sky-100 font-semibold text-sky-800'
                      : 'border-slate-100 text-slate-600 hover:bg-slate-50'
                  } ${isToday ? 'font-extrabold ring-2 ring-primary-500 ring-offset-1' : ''}`}
                >
                  {day}
                  {hasEvent && <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-sky-600" />}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-slate-900">Upcoming Events</h2>
            <p className="mt-0.5 text-xs text-slate-500">Manage scheduled activities without leaving this view.</p>
          </div>
          {loading ? (
            <SkeletonList rows={4} />
          ) : upcomingEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              No upcoming events scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <article key={event.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{event.title}</h3>
                      <div className="mt-2 space-y-1 text-xs text-slate-500">
                        <p className="flex items-center gap-1.5"><IoTimeOutline /> {event.date} at {event.time}</p>
                        <p className="flex items-center gap-1.5"><IoLocationOutline /> {event.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" aria-label={`Edit ${event.title}`} onClick={() => handleEdit(event)}>
                        <IoPencilOutline className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="danger" aria-label={`Delete ${event.title}`} onClick={() => handleDelete(event.id)}>
                        <IoTrashOutline className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {event.description && <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>}
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvent ? 'Edit Event' : 'Create New Event'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              name="date"
              type="date"
              min={todayDate()}
              value={formData.date}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : `${selectedEvent ? 'Update' : 'Create'} Event`}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminEvents;

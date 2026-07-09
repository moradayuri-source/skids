import { useState, useEffect } from 'react';
import { IoAddOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const todayDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
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

  const columns = [
    { key: 'title', header: 'Event Title' },
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time' },
    { key: 'location', header: 'Location' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <IoPencilOutline className="w-4 h-4" />
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <IoTrashOutline className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Create and manage SK events and activities.</p>
        </div>
        <Button onClick={handleAdd} icon={IoAddOutline}>
          Create Event
        </Button>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : (
          <Table
            columns={columns}
            data={events}
            emptyMessage="No events scheduled."
          />
        )}
      </Card>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
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

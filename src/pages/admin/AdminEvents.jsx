import { useState, useEffect } from 'react';
import { IoAddOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import { getEvents } from '../../utils/mockData';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    // Future API call: fetchEvents()
    // axios.get('/api/admin/events')
    //   .then(response => setEvents(response.data))
    //   .catch(error => console.error('Error fetching events:', error));

    const data = getEvents();
    setEvents(data);
    setLoading(false);
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

  const handleDelete = (id) => {
    // Future API call: deleteEvent(id)
    // axios.delete(`/api/admin/events/${id}`)
    //   .then(() => {
    //     setEvents(events.filter(e => e.id !== id));
    //   })
    //   .catch(error => console.error('Error deleting event:', error));

    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const handleSubmit = () => {
    // Future API call: add or update event
    // if (selectedEvent) {
    //   axios.put(`/api/admin/events/${selectedEvent.id}`, formData)
    //     .then(response => {
    //       setEvents(events.map(e => e.id === selectedEvent.id ? response.data : e));
    //       setIsModalOpen(false);
    //     })
    //     .catch(error => console.error('Error updating event:', error));
    // } else {
    //   axios.post('/api/admin/events', formData)
    //     .then(response => {
    //       setEvents([...events, response.data]);
    //       setIsModalOpen(false);
    //     })
    //     .catch(error => console.error('Error adding event:', error));
    // }

    if (selectedEvent) {
      setEvents(events.map(e => 
        e.id === selectedEvent.id ? { ...e, ...formData } : e
      ));
    } else {
      const newEvent = {
        id: events.length + 1,
        ...formData
      };
      setEvents([...events, newEvent]);
    }
    setIsModalOpen(false);
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
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedEvent ? 'Update' : 'Create'} Event
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminEvents;

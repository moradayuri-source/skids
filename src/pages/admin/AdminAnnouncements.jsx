import { useState, useEffect } from 'react';
import { IoAddOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import { getAnnouncements } from '../../utils/mockData';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Medium'
  });

  useEffect(() => {
    // Future API call: fetchAnnouncements()
    // axios.get('/api/admin/announcements')
    //   .then(response => setAnnouncements(response.data))
    //   .catch(error => console.error('Error fetching announcements:', error));

    const data = getAnnouncements();
    setAnnouncements(data);
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

  const columns = [
    { key: 'title', header: 'Title' },
    { 
      header: 'Priority',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(row.priority)}`}>
          {row.priority}
        </span>
      )
    },
    { key: 'date', header: 'Date' },
    { key: 'author', header: 'Author' },
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
    setSelectedAnnouncement(null);
    setFormData({ title: '', content: '', priority: 'Medium' });
    setIsModalOpen(true);
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData(announcement);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    // Future API call: deleteAnnouncement(id)
    // axios.delete(`/api/admin/announcements/${id}`)
    //   .then(() => {
    //     setAnnouncements(announcements.filter(a => a.id !== id));
    //   })
    //   .catch(error => console.error('Error deleting announcement:', error));

    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleSubmit = () => {
    // Future API call: add or update announcement
    // if (selectedAnnouncement) {
    //   axios.put(`/api/admin/announcements/${selectedAnnouncement.id}`, formData)
    //     .then(response => {
    //       setAnnouncements(announcements.map(a => a.id === selectedAnnouncement.id ? response.data : a));
    //       setIsModalOpen(false);
    //     })
    //     .catch(error => console.error('Error updating announcement:', error));
    // } else {
    //   axios.post('/api/admin/announcements', formData)
    //     .then(response => {
    //       setAnnouncements([response.data, ...announcements]);
    //       setIsModalOpen(false);
    //     })
    //     .catch(error => console.error('Error adding announcement:', error));
    // }

    if (selectedAnnouncement) {
      setAnnouncements(announcements.map(a => 
        a.id === selectedAnnouncement.id ? { ...a, ...formData } : a
      ));
    } else {
      const newAnnouncement = {
        id: announcements.length + 1,
        ...formData,
        date: new Date().toISOString().split('T')[0],
        author: 'SK Chairwoman'
      };
      setAnnouncements([newAnnouncement, ...announcements]);
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
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">Create and manage official SK announcements.</p>
        </div>
        <Button onClick={handleAdd} icon={IoAddOutline}>
          New Announcement
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <SkeletonTable rows={5} columns={5} />
        ) : (
          <Table
            columns={columns}
            data={announcements}
            emptyMessage="No announcements found."
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedAnnouncement ? 'Update' : 'Publish'} Announcement
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;

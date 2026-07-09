import { useState, useEffect } from 'react';
import { IoAddOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const displayAnnouncement = (announcement) => ({
  ...announcement,
  date: announcement.publishedAt
    ? new Date(announcement.publishedAt).toLocaleDateString()
    : '',
  author: announcement.authorName || 'SK Admin',
});

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'Medium'
  });

  useEffect(() => {
    let active = true;
    api.admin
      .getAnnouncements()
      .then((response) => {
        if (active) setAnnouncements(response.data.map(displayAnnouncement));
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.admin.deleteAnnouncement(id);
        setAnnouncements((current) => current.filter((announcement) => announcement.id !== id));
      } catch (deleteError) {
        setError(deleteError.response?.data?.message || 'Unable to delete announcement.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      setError('Title and content are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        status: 'Published',
      };
      const response = selectedAnnouncement
        ? await api.admin.updateAnnouncement(selectedAnnouncement.id, payload)
        : await api.admin.addAnnouncement(payload);
      const saved = displayAnnouncement(response.data);
      setAnnouncements((current) =>
        selectedAnnouncement
          ? current.map((item) => (item.id === selectedAnnouncement.id ? saved : item))
          : [saved, ...current]
      );
      setIsModalOpen(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save announcement.');
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Create and manage official SK announcements.</p>
        </div>
        <Button onClick={handleAdd} icon={IoAddOutline}>
          New Announcement
        </Button>
      </div>

      <Card className="p-5 sm:p-6">
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="4"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : `${selectedAnnouncement ? 'Update' : 'Publish'} Announcement`}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAnnouncements;

import { useState, useEffect } from 'react';
import { IoSearchOutline, IoAddOutline, IoFilterOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const YouthManagement = () => {
  const [youthData, setYouthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYouth, setSelectedYouth] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    barangay: '',
    contact: '',
    email: '',
    gender: '',
    civilStatus: '',
    voterStatus: '',
    workStatus: ''
  });

  useEffect(() => {
    let active = true;
    api.admin
      .getYouth()
      .then((response) => {
        if (active) setYouthData(response.data);
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.response?.data?.message || 'Unable to load registered youth.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const columns = [
    {
      header: 'Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.user?.avatar ? (
            <img src={row.user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {row.name?.charAt(0)?.toUpperCase() || 'Y'}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            {row.user && <p className="text-xs text-green-600">Registered account</p>}
          </div>
        </div>
      ),
    },
    { key: 'age', header: 'Age' },
    { key: 'barangay', header: 'Barangay' },
    { key: 'contact', header: 'Contact' },
    { key: 'email', header: 'Email' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  const filteredData = youthData.filter(youth =>
    (youth.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (youth.barangay || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedYouth(null);
    setFormData({
      name: '',
      age: '',
      barangay: '',
      contact: '',
      email: '',
      gender: '',
      civilStatus: '',
      voterStatus: '',
      workStatus: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (youth) => {
    setSelectedYouth(youth);
    setFormData(youth);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this youth profile?')) {
      try {
        await api.admin.deleteYouth(id);
        setYouthData((current) => current.filter((youth) => youth.id !== id));
      } catch (deleteError) {
        setError(deleteError.response?.data?.message || 'Unable to delete youth profile.');
      }
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        age: formData.age ? Number(formData.age) : undefined,
        barangay: formData.barangay,
        contact: formData.contact,
        email: formData.email,
        gender: formData.gender,
        civilStatus: formData.civilStatus,
        voterStatus: formData.voterStatus,
        workStatus: formData.workStatus,
      };
      const response = selectedYouth
        ? await api.admin.updateYouth(selectedYouth.id, payload)
        : await api.admin.addYouth(payload);

      setYouthData((current) =>
        selectedYouth
          ? current.map((youth) => (youth.id === selectedYouth.id ? response.data : youth))
          : [response.data, ...current]
      );
      setIsModalOpen(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save youth profile.');
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
          <h1 className="page-title">Youth Information</h1>
          <p className="page-subtitle">Manage and organize registered youth profiles in your barangay.</p>
        </div>
        <Button onClick={handleAdd} icon={IoAddOutline}>
          Add Youth Member
        </Button>
      </div>

      <Card className="p-5 sm:p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by name or barangay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={IoSearchOutline}
            />
          </div>
          <Button variant="outline" icon={IoFilterOutline}>
            Filter
          </Button>
        </div>

        {loading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <Table
            columns={columns}
            data={filteredData}
            emptyMessage="No youth members found."
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedYouth ? 'Edit Youth Profile' : 'Add Youth Member'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Barangay"
            name="barangay"
            value={formData.barangay}
            onChange={handleInputChange}
            required
          />
          <Input
            label="Contact Number"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Civil Status</label>
            <select
              name="civilStatus"
              value={formData.civilStatus}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            >
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Voter Status</label>
            <select
              name="voterStatus"
              value={formData.voterStatus}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            >
              <option value="">Select Voter Status</option>
              <option value="Registered">Registered</option>
              <option value="Not Registered">Not Registered</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Work Status</label>
            <select
              name="workStatus"
              value={formData.workStatus}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            >
              <option value="">Select Work Status</option>
              <option value="Student">Student</option>
              <option value="Employed">Employed</option>
              <option value="Unemployed">Unemployed</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : `${selectedYouth ? 'Update' : 'Add'} Youth Member`}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default YouthManagement;

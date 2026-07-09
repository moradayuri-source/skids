import { useState, useEffect } from 'react';
import { IoSearchOutline, IoAddOutline, IoFilterOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import { getYouthProfiles } from '../../utils/mockData';

// Placeholder for future API calls
// import { getYouthProfiles, addYouthProfile, updateYouthProfile, deleteYouthProfile } from '../../services/api';

const YouthManagement = () => {
  const [youthData, setYouthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYouth, setSelectedYouth] = useState(null);
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
    // Future API call: fetchYouthProfiles()
    // axios.get('/api/admin/youth')
    //   .then(response => setYouthData(response.data))
    //   .catch(error => console.error('Error fetching youth data:', error));

    const data = getYouthProfiles();
    setYouthData(data);
    setLoading(false);
  }, []);

  const columns = [
    { key: 'name', header: 'Name' },
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
    youth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    youth.barangay.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDelete = (id) => {
    // Future API call: deleteYouthProfile(id)
    // axios.delete(`/api/admin/youth/${id}`)
    //   .then(() => {
    //     setYouthData(youthData.filter(youth => youth.id !== id));
    //   })
    //   .catch(error => console.error('Error deleting youth:', error));

    if (window.confirm('Are you sure you want to delete this youth profile?')) {
      setYouthData(youthData.filter(youth => youth.id !== id));
    }
  };

  const handleSubmit = () => {
    // Future API call: add or update youth profile
    // if (selectedYouth) {
    //   axios.put(`/api/admin/youth/${selectedYouth.id}`, formData)
    //     .then(response => {
    //       setYouthData(youthData.map(y => y.id === selectedYouth.id ? response.data : y));
    //       setIsModalOpen(false);
    //     })
    //     .catch(error => console.error('Error updating youth:', error));
    // } else {
    //   axios.post('/api/admin/youth', formData)
    //     .then(response => {
    //       setYouthData([...youthData, response.data]);
    //       setIsModalOpen(false);
    //     })
    //     .catch(error => console.error('Error adding youth:', error));
    // }

    if (selectedYouth) {
      setYouthData(youthData.map(y => 
        y.id === selectedYouth.id ? { ...y, ...formData } : y
      ));
    } else {
      const newYouth = {
        id: youthData.length + 1,
        ...formData
      };
      setYouthData([...youthData, newYouth]);
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
          <h1 className="text-2xl font-bold text-gray-900">Youth Management</h1>
          <p className="text-gray-500 mt-1">Manage and organize youth profiles in your barangay.</p>
        </div>
        <Button onClick={handleAdd} icon={IoAddOutline}>
          Add Youth Member
        </Button>
      </div>

      <Card className="p-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
            <select
              name="civilStatus"
              value={formData.civilStatus}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Voter Status</label>
            <select
              name="voterStatus"
              value={formData.voterStatus}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Voter Status</option>
              <option value="Registered">Registered</option>
              <option value="Not Registered">Not Registered</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Status</label>
            <select
              name="workStatus"
              value={formData.workStatus}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Work Status</option>
              <option value="Student">Student</option>
              <option value="Employed">Employed</option>
              <option value="Unemployed">Unemployed</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedYouth ? 'Update' : 'Add'} Youth Member
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default YouthManagement;

import { useState, useEffect } from 'react';
import { IoAddOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import { getBudgetReports } from '../../utils/mockData';

const BudgetManagement = () => {
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    status: 'Pending'
  });

  useEffect(() => {
    // Future API call: fetchBudgetReports()
    // axios.get('/api/admin/budget')
    //   .then(response => setBudgetData(response.data))
    //   .catch(error => console.error('Error fetching budget data:', error));

    const data = getBudgetReports();
    setBudgetData(data);
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Approved': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Rejected': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const columns = [
    { key: 'title', header: 'Budget Title' },
    { key: 'amount', header: 'Amount' },
    { key: 'category', header: 'Category' },
    { key: 'date', header: 'Date' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      )
    },
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
    setSelectedBudget(null);
    setFormData({ title: '', amount: '', category: '', status: 'Pending' });
    setIsModalOpen(true);
  };

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setFormData(budget);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    // Future API call: deleteBudgetReport(id)
    // axios.delete(`/api/admin/budget/${id}`)
    //   .then(() => {
    //     setBudgetData(budgetData.filter(b => b.id !== id));
    //   })
    //   .catch(error => console.error('Error deleting budget:', error));

    if (window.confirm('Are you sure you want to delete this budget report?')) {
      setBudgetData(budgetData.filter(b => b.id !== id));
    }
  };

  const handleSubmit = () => {
    // Future API call: add or update budget report
    // if (selectedBudget) {
    //   axios.put(`/api/admin/budget/${selectedBudget.id}`, formData)
    //     .then(response => {
    //       setBudgetData(budgetData.map(b => b.id === selectedBudget.id ? response.data : b));
    //       setIsModalOpen(false);
    //     })
    //     .catch(error => console.error('Error updating budget:', error));
    // } else {
    //   axios.post('/api/admin/budget', formData)
    //     .then(response => {
    //       setBudgetData([...budgetData, response.data]);
    //       setIsModalOpen(false);
    //     })
    //     .catch(error => console.error('Error adding budget:', error));
    // }

    if (selectedBudget) {
      setBudgetData(budgetData.map(b => 
        b.id === selectedBudget.id ? { ...b, ...formData } : b
      ));
    } else {
      const newBudget = {
        id: budgetData.length + 1,
        ...formData,
        date: new Date().toISOString().split('T')[0]
      };
      setBudgetData([...budgetData, newBudget]);
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
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-500 mt-1">Manage SK budget reports and financial data.</p>
        </div>
        <Button onClick={handleAdd} icon={IoAddOutline}>
          Add Budget Report
        </Button>
      </div>

      <Card className="p-6">
        {loading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <Table
            columns={columns}
            data={budgetData}
            emptyMessage="No budget reports found."
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBudget ? 'Edit Budget Report' : 'Add Budget Report'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Budget Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Amount"
              name="amount"
              placeholder="₱0.00"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedBudget ? 'Update' : 'Add'} Budget Report
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetManagement;

import { useState, useEffect } from 'react';
import { IoAddOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const BudgetManagement = () => {
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    status: 'Pending'
  });

  useEffect(() => {
    let active = true;
    api.admin
      .getBudget()
      .then((response) => {
        if (active) setBudgetData(response.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || 'Unable to load budget reports.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
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
    setFormData({ ...budget, amount: budget.rawAmount ?? budget.amount });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget report?')) {
      try {
        await api.admin.deleteBudget(id);
        setBudgetData((current) => current.filter((budget) => budget.id !== id));
      } catch (deleteError) {
        setError(deleteError.response?.data?.message || 'Unable to delete budget report.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.amount || !formData.category) {
      setError('Title, amount, and category are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: formData.title,
        amount: formData.amount,
        category: formData.category,
        status: formData.status,
      };
      const response = selectedBudget
        ? await api.admin.updateBudget(selectedBudget.id, payload)
        : await api.admin.addBudget(payload);
      setBudgetData((current) =>
        selectedBudget
          ? current.map((budget) => (budget.id === selectedBudget.id ? response.data : budget))
          : [response.data, ...current]
      );
      setIsModalOpen(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to save budget report.');
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
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-500 mt-1">Manage SK budget reports and financial data.</p>
        </div>
        <Button onClick={handleAdd} icon={IoAddOutline}>
          Add Budget Report
        </Button>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
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
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : `${selectedBudget ? 'Update' : 'Add'} Budget Report`}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetManagement;

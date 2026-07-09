import { useState, useEffect } from 'react';
import {
  IoAddOutline,
  IoDownloadOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoWalletOutline,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { cloudinaryAttachmentUrl, uploadToCloudinary } from '../../services/upload';

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
    status: 'Pending',
    file: null,
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

  const handleAdd = () => {
    setSelectedBudget(null);
    setFormData({ title: '', amount: '', category: '', status: 'Pending', file: null });
    setIsModalOpen(true);
  };

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setFormData({ ...budget, amount: budget.rawAmount ?? budget.amount, file: null });
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
      let uploadedFile = null;
      if (formData.file) {
        uploadedFile = await uploadToCloudinary(formData.file, { purpose: 'budgets' });
      }

      const payload = {
        title: formData.title,
        amount: formData.amount,
        category: formData.category,
        status: formData.status,
        ...(uploadedFile && {
          fileUrl: uploadedFile.secureUrl,
          fileKey: uploadedFile.publicId,
          fileSize: uploadedFile.bytes,
          cloudinary: uploadedFile,
        }),
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Budget Report</h1>
          <p className="page-subtitle">Upload financial reports and supporting budget documents.</p>
        </div>
        <Button onClick={handleAdd} icon={IoAddOutline}>
          Upload Report
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {loading ? (
        <SkeletonGrid items={6} />
      ) : budgetData.length === 0 ? (
        <Card className="p-12 text-center">
          <IoWalletOutline className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No budget reports found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {budgetData.map((budget) => (
            <Card key={budget.id} className="p-5" hoverable>
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-xl bg-primary-50 p-3 text-primary-600">
                  <IoWalletOutline className="h-5 w-5" />
                </div>
                <span className="text-xs text-slate-400">{budget.date}</span>
              </div>
              <h2 className="mt-4 truncate font-semibold text-slate-900">{budget.title}</h2>
              <p className="mt-2 text-xl font-bold text-emerald-600">{budget.amount}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="truncate text-xs text-slate-500">{budget.category}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusColor(budget.status)}`}>
                  {budget.status}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                {budget.fileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Download ${budget.title}`}
                    onClick={() => window.open(cloudinaryAttachmentUrl(budget.fileUrl, budget.title), '_blank', 'noopener,noreferrer')}
                  >
                    <IoDownloadOutline className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" aria-label={`Edit ${budget.title}`} onClick={() => handleEdit(budget)}>
                  <IoPencilOutline className="h-4 w-4" />
                </Button>
                <Button variant="danger" size="sm" aria-label={`Delete ${budget.title}`} onClick={() => handleDelete(budget.id)}>
                  <IoTrashOutline className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBudget ? 'Edit Budget Report' : 'Upload Budget Report'}
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Supporting File <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) =>
                setFormData((current) => ({ ...current, file: event.target.files?.[0] || null }))
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
            />
            {selectedBudget?.fileUrl && !formData.file && (
              <p className="mt-1 text-xs text-gray-500">The current attachment will be kept.</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
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

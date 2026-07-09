import { useEffect, useState } from 'react';
import { IoAddOutline, IoShieldCheckmarkOutline, IoTrashOutline } from 'react-icons/io5';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const ManagerManagement = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    let active = true;
    api.admin.managers
      .list()
      .then((response) => {
        if (active) setManagers(response.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || 'Unable to load managers.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const addManager = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Manager name and Google email are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await api.admin.managers.add(formData);
      setManagers((current) => [
        response.data,
        ...current.filter((manager) => manager.id !== response.data.id),
      ]);
      setFormData({ name: '', email: '' });
      setIsModalOpen(false);
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Unable to add manager.');
    } finally {
      setSaving(false);
    }
  };

  const removeManager = async (manager) => {
    if (!window.confirm(`Remove management access for ${manager.name}?`)) return;

    try {
      await api.admin.managers.remove(manager.id);
      setManagers((current) => current.filter((item) => item.id !== manager.id));
    } catch (removeError) {
      setError(removeError.response?.data?.message || 'Unable to remove manager access.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Accounts</h1>
          <p className="mt-1 text-gray-500">
            Grant operational access. Managers cannot add or remove other managers.
          </p>
        </div>
        <Button icon={IoAddOutline} onClick={() => setIsModalOpen(true)}>
          Add Manager
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="p-6">
        {loading ? (
          <SkeletonList rows={3} />
        ) : managers.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No manager accounts assigned.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {managers.map((manager) => (
              <div key={manager.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <IoShieldCheckmarkOutline className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{manager.name}</p>
                  <p className="truncate text-sm text-gray-500">{manager.email}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => removeManager(manager)}>
                  <IoTrashOutline className="h-4 w-4" />
                  <span className="ml-1">Remove</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Manager Account"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="Google Email"
            type="email"
            value={formData.email}
            onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
          />
          <p className="text-xs text-gray-500">
            The manager should sign in using this exact Google account.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={addManager} disabled={saving}>
            {saving ? 'Adding...' : 'Add Manager'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerManagement;

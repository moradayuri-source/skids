import { useState, useEffect } from 'react';
import { IoAddOutline, IoTrashOutline, IoDownloadOutline, IoDocumentTextOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import { getDocuments } from '../../utils/mockData';
import { api } from '../../services/api';
import { uploadToCloudinary } from '../../services/upload';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    file: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchDocuments = async () => {
      try {
        const response = await api.admin.getDocuments();
        if (isMounted) {
          setDocuments(response.data);
        }
      } catch {
        if (isMounted) {
          setDocuments(getDocuments());
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      Approved: 'bg-green-100 text-green-700',
      Filed: 'bg-blue-100 text-blue-700',
      Draft: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleDownload = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.admin.deleteDocument(id);
      } catch {
        // Keeps mock-data delete usable when the backend is not running locally.
      } finally {
        setDocuments((current) => current.filter((document) => document.id !== id));
      }
    }
  };

  const columns = [
    { key: 'title', header: 'Document Title' },
    { key: 'type', header: 'Type' },
    { key: 'date', header: 'Upload Date' },
    { key: 'fileSize', header: 'File Size' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={!row.fileUrl}
            onClick={() => handleDownload(row)}
          >
            <IoDownloadOutline className="w-4 h-4" />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>
            <IoTrashOutline className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!formData.title || !formData.type || !formData.file) {
      setError('Add a title, type, and file before uploading.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const cloudinary = await uploadToCloudinary(formData.file, {
        purpose: 'documents',
      });

      const response = await api.admin.uploadDocument({
        title: formData.title,
        type: formData.type,
        fileUrl: cloudinary.secureUrl,
        fileKey: cloudinary.publicId,
        fileSize: cloudinary.bytes,
        cloudinary,
      });

      setDocuments((current) => [response.data, ...current]);
      setIsModalOpen(false);
      setFormData({ title: '', type: '', file: null });
    } catch (err) {
      setError(err.message || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0],
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-500 mt-1">Store and manage official SK documents.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={IoAddOutline}>
          Upload Document
        </Button>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="mb-6">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={IoDocumentTextOutline}
          />
        </div>
        {loading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <Table
            columns={columns}
            data={filteredDocuments}
            emptyMessage="No documents found."
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Document"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Document Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Type</option>
              <option value="Resolution">Resolution</option>
              <option value="Report">Report</option>
              <option value="Plan">Plan</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentManagement;

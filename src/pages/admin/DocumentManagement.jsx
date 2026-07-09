import { useState, useEffect } from 'react';
import { IoAddOutline, IoTrashOutline, IoDownloadOutline, IoDocumentTextOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FilePreview from '../../components/common/FilePreview';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { cloudinaryAttachmentUrl, uploadToCloudinary } from '../../services/upload';

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
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.response?.data?.message || 'Unable to load documents.');
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
      window.open(
        cloudinaryAttachmentUrl(document.fileUrl, document.title),
        '_blank',
        'noopener,noreferrer'
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.admin.deleteDocument(id);
        setDocuments((current) => current.filter((document) => document.id !== id));
      } catch (deleteError) {
        setError(deleteError.response?.data?.message || 'Unable to delete document.');
      }
    }
  };

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Approved Resolution</h1>
          <p className="page-subtitle">Upload approved resolutions with supporting documentation.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={IoAddOutline}>
          Upload Document
        </Button>
      </div>

      <Card className="p-5 sm:p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
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
          <SkeletonGrid items={6} />
        ) : filteredDocuments.length === 0 ? (
          <div className="py-12 text-center">
            <IoDocumentTextOutline className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No documents found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((document) => (
              <article key={document.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
                <FilePreview
                  url={document.fileUrl}
                  format={document.cloudinary?.format}
                  title={document.title}
                  className="h-36 w-full border-b border-slate-100"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-slate-900">{document.title}</h2>
                      <p className="mt-1 text-xs text-slate-500">{document.type} - {document.fileSize}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">{document.date}</p>
                  <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button size="sm" variant="outline" disabled={!document.fileUrl} aria-label={`Download ${document.title}`} onClick={() => handleDownload(document)}>
                      <IoDownloadOutline className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="danger" aria-label={`Delete ${document.title}`} onClick={() => handleDelete(document.id)}>
                      <IoTrashOutline className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Document Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
            >
              <option value="">Select Type</option>
              <option value="Resolution">Resolution</option>
              <option value="Report">Report</option>
              <option value="Plan">Plan</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">File</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100"
              required
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
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

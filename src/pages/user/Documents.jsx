import { useEffect, useState } from 'react';
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoGridOutline,
  IoListOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FilePreview from '../../components/common/FilePreview';
import Input from '../../components/common/Input';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { cloudinaryAttachmentUrl } from '../../services/upload';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.user
      .getDocuments()
      .then((response) => {
        if (active) setDocuments(response.data);
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || 'Unable to load documents.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredDocuments = documents.filter((document) =>
    `${document.title} ${document.type}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadDocument = (document) => {
    if (!document.fileUrl) return;
    window.open(cloudinaryAttachmentUrl(document.fileUrl, document.title), '_blank', 'noopener,noreferrer');
  };

  const viewToggle = (
    <div className="flex rounded-lg border border-gray-200 bg-white p-1">
      <button
        type="button"
        onClick={() => setViewMode('grid')}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
          viewMode === 'grid' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'
        }`}
      >
        <IoGridOutline className="h-4 w-4" /> Show in Grid
      </button>
      <button
        type="button"
        onClick={() => setViewMode('list')}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
          viewMode === 'list' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'
        }`}
      >
        <IoListOutline className="h-4 w-4" /> Show in List
      </button>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-gray-500">Access official SK documents, resolutions, and reports.</p>
        </div>
        {viewToggle}
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
            onChange={(event) => setSearchTerm(event.target.value)}
            icon={IoSearchOutline}
          />
        </div>

        {loading ? (
          <SkeletonGrid items={6} />
        ) : filteredDocuments.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No documents found.</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((document) => (
              <article key={document.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md">
                <FilePreview
                  url={document.fileUrl}
                  format={document.cloudinary?.format}
                  title={document.title}
                  className="h-48 w-full border-b border-gray-200"
                />
                <div className="p-4">
                  <h3 className="truncate font-semibold text-gray-900">{document.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{document.type} • {document.fileSize}</p>
                  <Button
                    className="mt-4 w-full"
                    variant="primary"
                    disabled={!document.fileUrl}
                    onClick={() => downloadDocument(document)}
                  >
                    <IoDownloadOutline className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
                  <IoDocumentTextOutline className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-gray-900">{document.title}</h3>
                  <p className="text-sm text-gray-500">{document.type} • {document.fileSize} • {document.date}</p>
                </div>
                <Button
                  size="sm"
                  disabled={!document.fileUrl}
                  onClick={() => downloadDocument(document)}
                >
                  <IoDownloadOutline className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Documents;

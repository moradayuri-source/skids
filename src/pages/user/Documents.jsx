import { useState, useEffect } from 'react';
import { IoDocumentTextOutline, IoDownloadOutline, IoSearchOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { SkeletonGrid } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchDocuments = async () => {
      try {
        const response = await api.user.getDocuments();
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

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      'Approved': 'bg-green-100 text-green-700',
      'Filed': 'bg-blue-100 text-blue-700',
      'Draft': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleDownload = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    alert(`No uploaded file URL is available for ${doc.title}.`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Access official SK documents, resolutions, and reports.</p>
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
            icon={IoSearchOutline}
          />
        </div>

        {loading ? (
          <SkeletonGrid items={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No documents found.
            </div>
            ) : (
              filteredDocuments.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <IoDocumentTextOutline className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{doc.type}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{doc.fileSize}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <IoDownloadOutline className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Documents;

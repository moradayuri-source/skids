import { useEffect, useState } from 'react';
import {
  IoCheckmarkCircle,
  IoDownloadOutline,
  IoGridOutline,
  IoListOutline,
  IoTimeOutline,
  IoWalletOutline,
} from 'react-icons/io5';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FilePreview from '../../components/common/FilePreview';
import { SkeletonCard, SkeletonList } from '../../components/common/Skeleton';
import { api } from '../../services/api';
import { cloudinaryAttachmentUrl } from '../../services/upload';

const BudgetTransparency = () => {
  const [budgetReports, setBudgetReports] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.user
      .getBudget()
      .then((response) => {
        if (active) setBudgetReports(response.data);
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

  const totalBudget = budgetReports.reduce(
    (sum, report) => sum + Number(report.rawAmount || 0),
    0
  );

  const downloadAttachment = (report) => {
    if (!report.fileUrl) return;
    window.open(cloudinaryAttachmentUrl(report.fileUrl, report.title), '_blank', 'noopener,noreferrer');
  };

  const statusIcon = (status) =>
    status === 'Approved'
      ? <IoCheckmarkCircle className="h-5 w-5 text-green-500" />
      : <IoTimeOutline className="h-5 w-5 text-yellow-500" />;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Transparency</h1>
          <p className="mt-1 text-gray-500">View SK budget reports and fund allocations.</p>
        </div>
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
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => <SkeletonCard key={index} />)}
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-2xl font-bold text-primary-600">
              ₱{totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{budgetReports.length}</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-sm text-gray-500">Approved Reports</p>
            <p className="text-2xl font-bold text-green-600">
              {budgetReports.filter((report) => report.status === 'Approved').length}
            </p>
          </Card>
        </div>
      )}

      {loading ? (
        <SkeletonList rows={4} />
      ) : budgetReports.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No budget reports available.</Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {budgetReports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <FilePreview
                url={report.fileUrl}
                format={report.cloudinary?.format}
                title={report.title}
                className="h-44 w-full border-b border-gray-200"
              />
              <div className="p-5">
                <div className="flex items-start gap-2">
                  <IoWalletOutline className="mt-0.5 h-5 w-5 text-primary-600" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-lg font-bold text-primary-600">{report.amount}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>{report.category}</span>
                  <span>{report.date}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-medium">
                    {statusIcon(report.status)} {report.status}
                  </span>
                  {report.fileUrl && (
                    <Button size="sm" onClick={() => downloadAttachment(report)}>
                      <IoDownloadOutline className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="divide-y divide-gray-100 p-6">
          {budgetReports.map((report) => (
            <div key={report.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
              <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
                <IoWalletOutline className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-gray-900">{report.title}</h3>
                <p className="text-sm text-gray-500">{report.category} • {report.date}</p>
              </div>
              <p className="font-semibold text-primary-600">{report.amount}</p>
              <span className="flex items-center gap-1 text-sm">{statusIcon(report.status)} {report.status}</span>
              {report.fileUrl && (
                <Button size="sm" onClick={() => downloadAttachment(report)}>
                  <IoDownloadOutline className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default BudgetTransparency;

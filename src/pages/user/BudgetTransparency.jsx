import { useState, useEffect } from 'react';
import { IoWalletOutline, IoCheckmarkCircle, IoTimeOutline } from 'react-icons/io5';
import Card from '../../components/common/Card';
import { SkeletonCard, SkeletonList } from '../../components/common/Skeleton';
import { getBudgetReports } from '../../utils/mockData';

const BudgetTransparency = () => {
  const [budgetReports, setBudgetReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Future API call: fetchBudgetReports()
    // axios.get('/api/budget')
    //   .then(response => setBudgetReports(response.data))
    //   .catch(error => console.error('Error fetching budget data:', error));

    setBudgetReports(getBudgetReports());
    setLoading(false);
  }, []);

  const totalBudget = budgetReports.reduce((sum, report) => {
    const amount = parseFloat(report.amount.replace(/[₱,]/g, ''));
    return sum + amount;
  }, 0);

  const getStatusIcon = (status) => {
    return status === 'Approved' ? 
      <IoCheckmarkCircle className="w-5 h-5 text-green-500" /> : 
      <IoTimeOutline className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Budget Transparency</h1>
        <p className="text-gray-500 mt-1">View SK budget reports and fund allocations.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            {budgetReports.filter(r => r.status === 'Approved').length}
          </p>
        </Card>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <SkeletonList rows={4} />
        ) : budgetReports.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No budget reports available.</p>
          </Card>
        ) : (
          budgetReports.map((report) => (
            <Card key={report.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <IoWalletOutline className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">{report.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-medium text-gray-900">{report.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">{report.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(report.status)}
                        <span className={`text-sm font-medium ${
                          report.status === 'Approved' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetTransparency;

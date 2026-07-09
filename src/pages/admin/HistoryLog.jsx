import { useEffect, useState } from 'react';
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoRefreshOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import { SkeletonTable } from '../../components/common/Skeleton';
import { api } from '../../services/api';

const ACTION_LABELS = {
  login: 'Login',
  logout: 'Logout',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  profile_update: 'Profile update',
  other: 'Other',
};

const ACTION_STYLES = {
  login: 'bg-green-50 text-green-700',
  logout: 'bg-gray-100 text-gray-700',
  create: 'bg-blue-50 text-blue-700',
  update: 'bg-amber-50 text-amber-700',
  delete: 'bg-red-50 text-red-700',
  profile_update: 'bg-purple-50 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};

const initialFilters = {
  actionType: '',
  resourceType: '',
  dateFrom: '',
  dateTo: '',
};

const localDateBoundary = (date, endOfDay = false) => {
  if (!date) return '';

  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  );

  return value.toISOString();
};

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const HistoryLog = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({
    actionTypes: Object.keys(ACTION_LABELS).filter((type) => type !== 'other'),
    resourceTypes: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPagination((current) => ({ ...current, page: 1 }));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    let active = true;

    const loadLogs = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.admin.getHistory({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
          actionType: filters.actionType || undefined,
          resourceType: filters.resourceType || undefined,
          dateFrom: localDateBoundary(filters.dateFrom) || undefined,
          dateTo: localDateBoundary(filters.dateTo, true) || undefined,
        });

        if (!active) return;

        setLogs(response.data.logs);
        setPagination(response.data.pagination);
        setFilterOptions(response.data.filters);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError.response?.data?.message ||
            'Activity logs could not be loaded. Please try again.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLogs();

    return () => {
      active = false;
    };
  }, [
    debouncedSearch,
    filters.actionType,
    filters.dateFrom,
    filters.dateTo,
    filters.resourceType,
    pagination.limit,
    pagination.page,
    reloadKey,
  ]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setFilters(initialFilters);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (log) => (
        <div>
          <p className="font-medium text-gray-900">{log.user}</p>
          <p className="text-xs capitalize text-gray-500">{log.actorRole || 'User'}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log) => (
        <div>
          <span
            className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
              ACTION_STYLES[log.actionType] || ACTION_STYLES.other
            }`}
          >
            {ACTION_LABELS[log.actionType] || 'Other'}
          </span>
          <p className="mt-1 text-sm text-gray-700">{log.action}</p>
        </div>
      ),
    },
    {
      key: 'resourceType',
      header: 'Resource',
      render: (log) => (
        <div>
          <p>{log.resourceType || 'System'}</p>
          <p className="max-w-64 truncate text-xs text-gray-500" title={log.details}>
            {log.details || 'No additional details'}
          </p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date & Time',
      render: (log) => formatDate(log.date),
    },
  ];

  const hasFilters =
    searchTerm || Object.values(filters).some((value) => Boolean(value));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-1 text-gray-500">
            Review authentication, content changes, and profile updates.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          aria-label="Refresh activity logs"
          title="Refresh activity logs"
        >
          <IoRefreshOutline className="h-5 w-5" />
        </button>
      </div>

      <Card className="p-6">
        <div className="mb-6 space-y-4">
          <Input
            placeholder="Search user, action, or details"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            icon={IoSearchOutline}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-medium text-gray-700">
              Action
              <select
                name="actionType"
                value={filters.actionType}
                onChange={updateFilter}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All actions</option>
                {filterOptions.actionTypes.map((type) => (
                  <option key={type} value={type}>
                    {ACTION_LABELS[type] || type}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-gray-700">
              Resource
              <select
                name="resourceType"
                value={filters.resourceType}
                onChange={updateFilter}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All resources</option>
                {filterOptions.resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="From"
              name="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={updateFilter}
              max={filters.dateTo || undefined}
            />

            <Input
              label="To"
              name="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={updateFilter}
              min={filters.dateFrom || undefined}
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <SkeletonTable rows={8} columns={4} />
        ) : (
          <>
            <Table
              columns={columns}
              data={logs}
              hoverable={false}
              emptyMessage="No activity logs match these filters."
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                {pagination.total === 0
                  ? '0 results'
                  : `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )} of ${pagination.total}`}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPagination((current) => ({
                      ...current,
                      page: Math.max(1, current.page - 1),
                    }))
                  }
                  disabled={pagination.page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                  title="Previous page"
                >
                  <IoChevronBackOutline className="h-5 w-5" />
                </button>
                <span className="min-w-24 text-center text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPagination((current) => ({
                      ...current,
                      page: Math.min(current.totalPages, current.page + 1),
                    }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                  title="Next page"
                >
                  <IoChevronForwardOutline className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default HistoryLog;

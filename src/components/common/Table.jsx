const Table = ({
  columns,
  data,
  className = '',
  striped = false,
  hoverable = true,
  onRowClick,
  emptyMessage = 'No data available',
  ...props
}) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-100 ${className}`}>
      <table className="min-w-full divide-y divide-slate-100" {...props}>
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"
                style={{ width: column.width || 'auto' }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  ${hoverable ? 'cursor-pointer hover:bg-primary-50/40' : ''}
                  ${striped && rowIndex % 2 === 0 ? 'bg-slate-50/50' : ''}
                `}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-700"
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

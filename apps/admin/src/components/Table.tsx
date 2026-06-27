import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function Table<T extends { id?: string }>({ columns, data, emptyMessage = 'No data found' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#EEEEEE]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left py-3 px-4 text-xs font-semibold text-[#757575] uppercase tracking-wide whitespace-nowrap ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-[#757575]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={(row as Record<string, unknown>).id as string ?? idx}
                className="border-b border-[#EEEEEE] hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3 px-4 ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

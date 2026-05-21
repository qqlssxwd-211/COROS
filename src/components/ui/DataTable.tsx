import type { ReactNode } from 'react';

interface Column { key: string; label: string; render?: (val: unknown, row: Record<string, unknown>) => ReactNode; }
interface Props { columns: Column[]; rows: Record<string, unknown>[]; onRowClick?: (row: Record<string, unknown>) => void; }

export default function DataTable({ columns, rows, onRowClick }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.02]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.01]">
            {columns.map(c => (
              <th key={c.key} className="px-4 py-2.5 text-left text-[0.64rem] uppercase tracking-[0.05em] text-[#666] font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)}
              className={`border-b border-white/[0.02] ${onRowClick ? 'cursor-pointer hover:bg-white/[0.02]' : ''}`}>
              {columns.map(c => (
                <td key={c.key} className="px-4 py-2.5 text-[0.76rem] text-[#999]">
                  {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

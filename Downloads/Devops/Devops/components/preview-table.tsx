"use client";

import React from "react";

type Row = Record<string, any>;

interface PreviewTableProps {
  data?: Row[]; // preview rows
  title?: string;
  maxRows?: number;
  className?: string;
}

/**
 * PreviewTable
 *
 * - Renders a dynamic preview table for export/preview data.
 * - Columns are derived from the first row of `data` (preserves order).
 * - Shows friendly empty state when no data is provided.
 *
 * Visual improvements:
 * - Increased spacing and font sizes for readability
 * - Default to span 2 columns in grid layouts (`lg:col-span-2`)
 * - Responsive, scrollable table for wide datasets
 */
export default function PreviewTable({
  data = [],
  title = "Preview",
  maxRows = 25,
  className = "",
}: PreviewTableProps) {
  const rowCount = data?.length ?? 0;
  const previewRows = data ? data.slice(0, maxRows) : [];

  // Derive columns: prefer keys of first row, fall back to union of all keys
  let columns: string[] = [];
  if (previewRows.length > 0) {
    columns = Object.keys(previewRows[0]);
  } else if (rowCount > 0 && data) {
    const allKeys = new Set<string>();
    data.forEach((r) => Object.keys(r || {}).forEach((k) => allKeys.add(k)));
    columns = Array.from(allKeys);
  }

  const containerClasses = `bg-white rounded-[2.5rem] border border-border/40 shadow-xl shadow-black/[0.02] flex flex-col h-full overflow-hidden lg:col-span-2 relative ${className}`;

  return (
    <div className={containerClasses}>
      <div className="px-8 lg:px-10 py-8 border-b border-border/40 flex items-start justify-between gap-4 bg-[#F8FAFC]">
        <div>
          <h3 className="text-2xl font-black text-[#1E314D] tracking-tight">{title}</h3>
          <div className="text-sm font-semibold text-muted-foreground mt-2">
            {rowCount === 0
              ? "Awaiting data selection..."
              : `Displaying ${Math.min(rowCount, maxRows)} of ${rowCount} total records`}
          </div>
        </div>

        <div className="bg-white border-2 border-border/50 px-4 py-2 rounded-xl text-sm font-bold text-[#1E314D] shadow-sm">
          Live Database Preview
        </div>
      </div>

      {rowCount === 0 ? (
        <div className="p-8 text-center text-base text-gray-600">
          No preview available for the selected date range.
        </div>
      ) : (
        <div className="w-full overflow-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap"
                    scope="col"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white">
              {previewRows.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {columns.map((col) => {
                    const cell = row[col];

                    // Render simple types plainly; stringify complex ones
                    let display: React.ReactNode = "";
                    if (cell === null || cell === undefined) {
                      display = "";
                    } else if (
                      typeof cell === "string" ||
                      typeof cell === "number" ||
                      typeof cell === "boolean"
                    ) {
                      display = String(cell);
                    } else if (cell instanceof Date) {
                      display = cell.toLocaleString?.() ?? String(cell);
                    } else {
                      try {
                        const str = JSON.stringify(cell);
                        display =
                          str.length > 300 ? str.slice(0, 300) + "…" : str;
                      } catch {
                        display = String(cell);
                      }
                    }

                    return (
                      <td
                        key={col}
                        className="align-top px-6 py-4 text-sm text-gray-700 break-words max-w-[24rem]"
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

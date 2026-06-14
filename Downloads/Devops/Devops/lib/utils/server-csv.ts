export function toCSV(rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  return [
    headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const stringValue =
            value === null || value === undefined ? "" : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");
}

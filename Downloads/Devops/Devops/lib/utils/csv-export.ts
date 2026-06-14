/**
 * Convert JSON array to CSV and trigger download
 */
export function downloadCSV(
  data: Record<string, any>[],
  filename: string
) {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get column headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row with quotes
    headers.map((header) => `"${header}"`).join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle null/undefined and escape quotes
          const stringValue =
            value === null || value === undefined ? "" : String(value);
          const escaped = stringValue.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);

  console.log(`[Export] Downloaded ${filename} with ${data.length} records`);
}

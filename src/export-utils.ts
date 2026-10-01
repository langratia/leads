/**
 * Export an array of objects to a downloadable CSV file.
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
) {
  if (!data || data.length === 0) return;

  const cols =
    columns ||
    Object.keys(data[0]).map((key) => ({
      key: key as keyof T,
      header: key.replace(/_/g, " ").toUpperCase(),
    }));

  const headerRow = cols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");

  const rows = data.map((row) => {
    return cols
      .map((c) => {
        const val = row[c.key];
        const stringVal =
          val == null
            ? ""
            : typeof val === "object"
            ? JSON.stringify(val)
            : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  const csvContent = [headerRow, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function convertJsonToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) {
    return "";
  }

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys);

  // Create CSV header row
  const csvRows: string[] = [];
  csvRows.push(headers.map(escapeCSVValue).join(","));

  // Create data rows
  data.forEach((item) => {
    const values = headers.map((header) => {
      const value = item[header];
      return escapeCSVValue(value);
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  // Convert to string
  let stringValue = String(value);

  // If value contains comma, newline, or quotes, wrap in quotes and escape quotes
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    stringValue = '"' + stringValue.replace(/"/g, '""') + '"';
  }

  return stringValue;
}

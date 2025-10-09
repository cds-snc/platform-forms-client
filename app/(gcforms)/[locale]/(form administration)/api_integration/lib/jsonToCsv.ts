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

/* eslint-disable no-await-in-loop */
export const processJsonToCsv = async ({
  formId,
  jsonFileNames,
  directoryHandle,
}: {
  formId: string;
  jsonFileNames: string[];
  directoryHandle: unknown;
}) => {
  if (!directoryHandle || jsonFileNames.length === 0) return;

  try {
    // Read all JSON files and parse them
    const allData: Record<string, unknown>[] = [];

    for (const fileName of jsonFileNames) {
      try {
        const fileHandle = await (directoryHandle as FileSystemDirectoryHandle).getFileHandle(
          fileName
        );
        const file = await fileHandle.getFile();
        const content = await file.text();

        const jsonData = JSON.parse(content);
        // Handle both single objects and arrays
        if (Array.isArray(jsonData)) {
          allData.push(...jsonData);
        } else {
          allData.push(jsonData);
        }
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error(`Failed to parse ${fileName}:`, parseError);
      }
    }

    if (allData.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("No valid JSON data found to convert to CSV");
      return;
    }

    // Convert to CSV
    const csvContent = convertJsonToCSV(allData);

    // Write CSV file back to directory
    const csvFileName = `${formId}-responses-${Date.now()}.csv`;
    const csvFileHandle = await (directoryHandle as FileSystemDirectoryHandle).getFileHandle(
      csvFileName,
      { create: true }
    );

    const writable = await csvFileHandle.createWritable();
    await writable.write(csvContent);
    await writable.close();

    // eslint-disable-next-line no-console
    console.log(`CSV file created: ${csvFileName}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing JSON to CSV:", error);
  }
};

// File size conversion constants
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;
const KB_THRESHOLD = 500; // Show KB for files >= 500 bytes
const MB_THRESHOLD = 1040000; // Show MB for files >= ~1MB

/**
 * Converts bytes to megabytes with precision to 2 decimal places.
 * @param bytes - Size in bytes
 * @returns Size in megabytes
 */
export const bytesToMb = (bytes: number): number => {
  const mb = bytes / BYTES_PER_MB;
  return Math.round(mb * 100) / 100;
};

/**
 * Converts megabytes to bytes rounded to the nearest integer.
 * @param mb - Size in megabytes
 * @returns Size in bytes
 */
export const mbToBytes = (mb: number): number => {
  return Math.round(mb * BYTES_PER_MB);
};

/**
 * Converts kilobytes to bytes rounded to the nearest integer.
 * @param kb - Size in kilobytes
 * @returns Size in bytes
 */
export const kbToBytes = (kb: number): number => {
  return Math.round(kb * BYTES_PER_KB);
};

/**
 * Determines the appropriate unit and calculates size for display
 */
const calculateFileSize = (bytes: number): { size: number; unit: "bytes" | "KB" | "MB" } => {
  const absBytes = Math.abs(bytes);

  if (absBytes < KB_THRESHOLD) {
    return { size: bytes, unit: "bytes" };
  }

  if (absBytes < MB_THRESHOLD) {
    // Round KB to whole numbers (no decimals)
    const sizeInKb = Math.round(bytes / BYTES_PER_KB);
    return { size: sizeInKb, unit: "KB" };
  }

  // More precise MB calculation - round to 2 decimal places
  const sizeInMb = Math.round((bytes / BYTES_PER_MB) * 100) / 100;
  return { size: sizeInMb, unit: "MB" };
};

/**
 * Formats a number with proper locale-specific decimal separators
 */
const formatWithLocale = (size: number, language: string): string => {
  const locale = language === "fr" ? "fr-CA" : "en-CA";
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(size);
};

/**
 * Converts bytes to a string representation in bytes, KB, or MB.
 * Returns an object with size and unit (for i18n).
 * @param bytes - Size in bytes
 * @param language - Language for proper decimal formatting (optional)
 * @returns Object containing formatted size and unit
 */
export const bytesToKbOrMbString = (
  bytes: number,
  language?: string
): { size: number | string; unit: "bytes" | "KB" | "MB" } => {
  const { size, unit } = calculateFileSize(bytes);

  if (unit === "bytes") {
    return { size, unit };
  }

  if (unit === "KB") {
    return { size, unit };
  }

  return {
    size: language ? formatWithLocale(size, language) : size,
    unit,
  };
};

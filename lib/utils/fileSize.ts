/**
 * Converts bytes to megabytes with precision to 2 decimal places.
 * @param bytes - Size in bytes
 * @returns
 */
export const bytesToMb = (bytes: number): number => {
  const mb = bytes / (1024 * 1024);
  return Math.round(mb * 100) / 100;
};

/**
 * Converts megabytes to bytes rounded to the nearest integer.
 * @param mb - Size in megabytes
 * @returns
 */
export const mbToBytes = (mb: number): number => {
  return Math.round(mb * 1024 * 1024);
};

/**
 * Converts kilobytes to bytes rounded to the nearest integer.
 * @param kb - Size in kilobytes
 * @returns
 */
export const kbToBytes = (kb: number): number => {
  return Math.round(kb * 1024);
};

/**
 * Converts bytes to a string representation in bytes, KB, or MB.
 * Returns an object with size and unit (for i18n).
 * @param bytes - Size in bytes
 * @param language - Language for proper decimal formatting (optional)
 * @returns
 */
export const bytesToKbOrMbString = (
  bytes: number,
  language?: string
): { size: number | string; unit: "bytes" | "KB" | "MB" } => {
  const absBytes = Math.abs(bytes); // Handle negative values

  if (absBytes < 500) {
    return {
      size: bytes,
      unit: "bytes",
    };
  }

  let size: number;
  let unit: "KB" | "MB";

  if (absBytes < 1040000) {
    // Round KB to whole numbers (no decimals)
    size = Math.round(bytes / 1024);
    unit = "KB";
  } else {
    // More precise MB calculation - round to 2 decimal places
    size = Math.round((bytes / 1048576) * 100) / 100;
    unit = "MB";
  }

  // Format with proper decimal separator if language is provided
  if (language) {
    const formatter = new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: unit === "MB" ? 2 : 0, // No decimals for KB, up to 2 for MB
    });
    return {
      size: formatter.format(size),
      unit,
    };
  }

  return {
    size,
    unit,
  };
};

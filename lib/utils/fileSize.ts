/**
 * Converts bytes to megabytes rounded to the nearest half.
 * @param bytes - Size in bytes
 * @returns
 */
export const bytesToMb = (bytes: number): number => {
  const mb = bytes / (1024 * 1024);
  return Math.round(mb * 2) / 2;
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
 * @returns
 */
export const bytesToKbOrMbString = (
  bytes: number
): { size: number; unit: "bytes" | "KB" | "MB" } => {
  const absBytes = Math.abs(bytes); // Handle negative values
  if (absBytes < 500) {
    return {
      size: bytes,
      unit: "bytes",
    };
  }
  if (absBytes < 1040000) {
    return {
      size: Math.round((bytes / 1024) * 2) / 2,
      unit: "KB",
    };
  }
  return {
    size: Math.round((bytes / 1048576) * 2) / 2,
    unit: "MB",
  };
};

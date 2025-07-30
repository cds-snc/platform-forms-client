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
  if (absBytes < 1000000) {
    return {
      size: Math.round(bytes / 1000),
      unit: "KB",
    };
  }
  return {
    size: Math.round(bytes / 1000000),
    unit: "MB",
  };
};

/**
 * When we base64 encode a file, there is a ~35% overhead in file size.
 * This function calculates the size of the file after base64 encoding.
 * @param fileSize - Size of the file in bytes
 * @returns
 */
export const fileSizeWithBase64Overhead = (fileSize: number): number => {
  return Math.round(fileSize * 1.35);
};

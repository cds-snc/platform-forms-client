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

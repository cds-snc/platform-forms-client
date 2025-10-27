import { createHash } from "crypto";
import { FileInput } from "@gcforms/types";
import { logMessage } from "@lib/logger";

export function calculateMD5Checksum(content: ArrayBuffer): string {
  const buffer = Buffer.from(content);
  const hash = createHash("md5");
  hash.update(buffer);
  return hash.digest("base64");
}

export function calculateFileChecksum(file: FileInput): string {
  // Ensure file content is available
  if (!file.content) {
    throw new Error(`Unable to calculate checksum for file ${file.name}: no content available`);
  }
  return calculateMD5Checksum(file.content);
}

/**
 * Take our fileObjsRefs and generate file checksums map for each file
 * @param fileObjsRef - Map of file IDs to FileInput objects
 * @returns Map of file IDs to their MD5 checksums
 */
export function generateFileChecksums(
  fileObjsRef: Record<string, FileInput>
): Record<string, string> {
  const checksums: Record<string, string> = {};

  for (const [fileId, file] of Object.entries(fileObjsRef)) {
    try {
      checksums[fileId] = calculateFileChecksum(file);
    } catch (error) {
      logMessage.warn(`Failed to calculate checksum for file ${file.name}: ${error}`);
      // Continue with other files, don't fail the entire process
    }
  }

  return checksums;
}

import { md5 } from "hash-wasm";
import { FileInput } from "@gcforms/types";
import { logMessage } from "@lib/logger";

// Creates Hexadecimal base MD5 hash
export async function calculateMD5Checksum(content: ArrayBuffer): Promise<string> {
  const buffer = Buffer.from(content);
  return md5(buffer);
}

export async function calculateFileChecksum(file: FileInput): Promise<string> {
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
export async function generateFileChecksums(
  fileObjsRef: Record<string, FileInput>
): Promise<Record<string, string>> {
  const checksums: Record<string, string> = {};

  await Promise.all(
    Object.entries(fileObjsRef).map(async ([fileId, file]) => {
      try {
        checksums[fileId] = await calculateFileChecksum(file);
      } catch (error) {
        logMessage.warn(`Failed to calculate checksum for file ${file.name}: ${error}`);
        // Continue with other files, don't fail the entire process
      }
    })
  );

  return checksums;
}

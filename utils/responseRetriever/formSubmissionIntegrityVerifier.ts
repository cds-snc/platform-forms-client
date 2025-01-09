import { createHash } from "node:crypto";

export const verifyIntegrity = (answers: string, checksum: string) => {
  try {
    const generatedChecksumFromReceivedData = createHash("md5").update(answers).digest("hex");

    return generatedChecksumFromReceivedData.toString() === checksum;
  } catch (error) {
    throw new Error("Failed to verify integrity", { cause: error });
  }
};

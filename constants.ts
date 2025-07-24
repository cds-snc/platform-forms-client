import { kbToBytes, mbToBytes } from "@lib/utils/fileSize";

// Note 5mb is also defined for Server actions in next.config.mjs
export const BODY_SIZE_LIMIT = mbToBytes(5);
export const BODY_SIZE_LIMIT_WITH_FILES = Number(
  process.env.NEXT_PUBLIC_BODY_SIZE_LIMIT_WITH_FILES || mbToBytes(6)
);

export const MAX_FILE_SIZE = 10485760; // 10 MB matches file upload lambda see: generateSignedUrl
export const MAX_RESPONSE_SIZE = kbToBytes(380);

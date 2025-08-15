import { kbToBytes, mbToBytes } from "@lib/utils/fileSize";

// Note 5mb is also defined for Server actions in next.config.mjs
export const BODY_SIZE_LIMIT = mbToBytes(5);
export const MAX_FILE_SIZE = 10485760; // 10 MB matches file upload lambda see: generateSignedUrl
export const MAX_RESPONSE_SIZE = kbToBytes(380);

export const MAX_DYNAMIC_ROW_AMOUNT = 25;

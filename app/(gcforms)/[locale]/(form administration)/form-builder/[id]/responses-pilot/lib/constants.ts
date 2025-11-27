/**
 * Number of submissions to process in each batch
 */
export const BATCH_SIZE = 5;

/**
 * Delay in milliseconds to wait for async operations to cleanup when interrupted
 */
export const INTERRUPT_CLEANUP_DELAY_MS = 500;

/**
 * Folder within the selected directory to store HTML downloads
 */
export const HTML_DOWNLOAD_FOLDER = "html";

/**
 * Folder within the selected directory to store raw response data
 */
export const RAW_RESPONSE_FOLDER = "data";

/**
 * Folder within the selected directory to store attachments
 */
export const ATTACHMENTS_FOLDER = "attachments";

/**
 * Folder within the attachments directory to store potentially malicious attachments
 */
export const MALICIOUS_ATTACHMENTS_FOLDER = "suspicious";

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
export const HTML_DOWNLOAD_FOLDER = "html_responses-reponses_html";

/**
 * Folder within the selected directory to store raw response data
 */
export const RAW_RESPONSE_FOLDER = "raw_data-donnees_brutes";

/**
 * Folder within the selected directory to store attachments
 */
export const ATTACHMENTS_FOLDER = "file_attachments-fichiers_joints";

/**
 * Folder within the attachments directory to store potentially malicious attachments
 */
export const MALICIOUS_ATTACHMENTS_FOLDER = "suspicious_files-fichiers_suspects";

/**
 * Folder within the selected directory to store logs
 */
export const LOGS_FOLDER = "logs-journaux";

/**
 * Filename for the attachment mapping file
 */
export const MAPPING_FILENAME = "mapping.json";

/**
 * Prefix for download log filenames
 */
export const DOWNLOAD_LOG_FILENAME_PREFIX = "log-journal-";

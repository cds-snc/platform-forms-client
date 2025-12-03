/**
 * Delay in milliseconds to wait for async operations to cleanup when interrupted
 */
export const INTERRUPT_CLEANUP_DELAY_MS = 500;

/**
 * Note: if you change any of these folder names, consider how it may impact
 * existing users who may have already downloaded responses to disk with the
 * old folder names. You may need to implement a migration strategy.
 */

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

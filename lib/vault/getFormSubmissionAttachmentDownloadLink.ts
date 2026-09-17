import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@lib/integration/awsServicesConnector";
import { logMessage } from "@lib/logger";

const SIGNED_URL_EXPIRY_SECONDS = 60;

export const getFormSubmissionAttachmentDownloadLink = async (path: string) => {
  const bucketName = process.env.VAULT_FILE_STORAGE_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("VAULT_FILE_STORAGE_BUCKET_NAME is not configured");
  }

  try {
    return await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: path,
      }),
      { expiresIn: SIGNED_URL_EXPIRY_SECONDS }
    );
  } catch (error) {
    logMessage.error(
      `[s3] Failed to generate form submission attachment download link. Path: ${path}. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw error;
  }
};

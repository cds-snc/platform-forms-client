import { v4 as uuid } from "uuid";
import { logMessage } from "@lib/logger";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { s3Client } from "./integration/awsServicesConnector";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const bucketName: string =
  process.env.RELIABILITY_FILE_STORAGE ?? "forms-staging-reliability-file-storage";

/**
 *
 * @param bucketName
 * @param fileKey
 * @returns
 */
const deleteObject = async (fileKey: string): Promise<void> => {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: fileKey }));
  } catch (error) {
    logMessage.error(error as Error);
  }
};

/**
 *
 * @param fileName File name to generate signed URL for
 * @description Generates a signed URL for uploading a file to S3.
 * @returns Signed URL
 */

export const generateSignedUrl = async (fileName: string) => {
  const presigned = await createPresignedPost(s3Client, {
    Bucket: bucketName,
    Key: `form_attachments/${new Date().toISOString().slice(0, 10)}/${uuid()}/${fileName}`,
    Fields: {
      acl: "bucket-owner-full-control",
    },
    Conditions: [
      ["content-length-range", 0, 10485760], // 10 MB max file size
    ],
    Expires: 600, // URL expires in 10 minutes
  });
  logMessage.debug(
    `Generated signed URL for file upload: ${presigned.url} with key: ${presigned.fields.key}`
  );
  return presigned;
};

export { deleteObject };

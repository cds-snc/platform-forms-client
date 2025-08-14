import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "ca-central-1",
  retryMode: "standard",
});

export async function cleanUpFileAttachments(filePaths: string[]): Promise<void> {
  const deleteFileAttachmentOperations = filePaths.map((filePath) => {
    return s3Client.send(
      new DeleteObjectCommand({
        Bucket: "forms-staging-vault-file-storage",
        Key: filePath,
      })
    );
  });

  await Promise.all(deleteFileAttachmentOperations).catch((error) => {
    throw new Error(`Failed to clean up file attachments. Reason: ${(error as Error).message}`);
  });
}

import config from "../../config.json";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomBytes } from "node:crypto";
import os from "os";

export type FileAttachment = {
  name: string;
  path: string;
};

type RandomFile = {
  name: string;
  data: Buffer<ArrayBufferLike>;
};

const s3Client = new S3Client({
  region: "ca-central-1",
  retryMode: "standard",
});

export async function setUpFileAttachments(): Promise<FileAttachment[]> {
  const randomFiles = generateRandomFiles();

  const uploadFileAttachmentOperations = randomFiles.map((randomFile) => {
    const key = `test-setup/${os.userInfo().username}/${randomFile.name}.txt`;

    return s3Client
      .send(
        new PutObjectCommand({
          Bucket: config.gcFormsInfra.vaultFileStorageS3BucketName,
          Key: key,
          Body: randomFile.data,
          Tagging: "GuardDutyMalwareScanStatus=NO_THREATS_FOUND",
        })
      )
      .then(() => ({ name: randomFile.name, path: key }));
  });

  return Promise.all(uploadFileAttachmentOperations).catch((error) => {
    throw new Error(`Failed to set up file attachments. Reason: ${(error as Error).message}`);
  });
}

function generateRandomFiles(): RandomFile[] {
  return Array.from({ length: 5 }).map(() => {
    return {
      name: randomBytes(8).toString("hex"),
      data: randomBytes(2097152),
    };
  });
}

import { ReadStream } from "fs";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { UploadResult } from "./types";
import { logMessage } from "./logger";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import formidable from "formidable";

const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? "ca-central-1",
  endpoint: process.env.LOCAL_S3_ENDPOINT,
  forcePathStyle: process.env.LOCAL_S3_ENDPOINT ? true : undefined,
});

const bucketName: string =
  process.env.RELIABILITY_FILE_STORAGE ?? "forms-staging-reliability-file-storage";

/**
 * This function tries to upload a given file to aws S3 bucket and returns a data object
 * which stores an url.
 * @param file
 * @returns
 */
const uploadFileToS3 = async (file: formidable.File): Promise<UploadResult> => {
  try {
    const data = await readStream2buffer(fs.createReadStream(file.path));
    const objectKey = `form_attachments/${new Date().toISOString().slice(0, 10)}/${uuid()}/${
      file.name
    }`;

    // setting the parameters
    const uploadParams = {
      Bucket: bucketName,
      Body: data,
      Key: objectKey,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    return {
      isValid: true,
      key: uploadParams.Key,
    };
  } catch (error) {
    return { isValid: false, key: error as string };
  }
};

/**
 * Read and return a Buffer object from a Stream.
 * @param mystream
 * @returns buffer array.
 */
const readStream2buffer = (fileStream: ReadStream): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf: Uint8Array[] = [];
    fileStream.on("data", (datachunk) => {
      if (typeof datachunk === "string" || datachunk instanceof String) {
        _buf.push(Buffer.from(datachunk, "utf8"));
      } else {
        _buf.push(datachunk as Buffer);
      }
    });
    fileStream.on("end", () => {
      resolve(Buffer.concat(_buf));
    });
    fileStream.on("error", (err) => {
      reject(err);
    });
  });
};

/**
 * Push a given file to a temporary S3
 * @param fileOrArray
 * @param reqFields
 * @param key
 */
const pushFileToS3 = async (file: formidable.File): Promise<UploadResult> => {
  // Set bucket name default value to something actual value once known
  const uploadResult: UploadResult = await uploadFileToS3(file);
  const { isValid, key } = uploadResult;
  if (!isValid) {
    throw new Error(key);
  }
  return uploadResult;
};

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

export { uploadFileToS3, readStream2buffer, deleteObject, pushFileToS3 };

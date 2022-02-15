import { v4 as uuid } from "uuid";
import { ProcessedFile, UploadResult } from "./types";
import { logMessage } from "./logger";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

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
const uploadFileToS3 = async (file: ProcessedFile): Promise<UploadResult> => {
  try {
    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null);
    const data = await readStream2buffer(stream);
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
const readStream2buffer = (fileStream: Readable): Promise<Buffer> => {
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
 * @param file
 */
const pushFileToS3 = async (file: ProcessedFile): Promise<UploadResult> => {
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

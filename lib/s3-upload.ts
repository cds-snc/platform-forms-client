import { ReadStream } from "fs";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { UploadResult } from "./types";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import formidable from "formidable";

const s3Client = new S3Client({ region: "ca-central-1" });

/**
 * This function tries to upload a given file to aws S3 bucket and returns a data object
 * which stores an url.
 * @param file
 * @param bucketName
 * @param filePath
 * @returns
 */
const uploadFileToS3 = async (
  file: formidable.File,
  bucketName: string,
  filePath: string
): Promise<UploadResult> => {
  try {
    const data = await readStream2buffer(fs.createReadStream(file.path));
    const objectKey = `${bucketName}/user_file/${new Date()
      .toISOString()
      .slice(0, 10)}/${uuid()}.${filePath}`;

    // setting the parameters
    const uploadParams = {
      Bucket: bucketName,
      Body: data,
      Key: objectKey,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(uploadParams), {
      expiresIn: 3600 * 24 * 4,
    });
    const result: UploadResult = {
      isValid: true,
      result: signedUrl,
      key: uploadParams.Key,
    };
    return result;
  } catch (error) {
    const result: UploadResult = { isValid: false, result: error };
    return result;
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
 *
 * @param bucketName
 * @param fileKey
 * @returns
 */
const deleteObject = async (bucketName: string, fileKey: string): Promise<void> => {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: fileKey }));
  } catch (error) {
    console.error(error);
  }
};

export { uploadFileToS3, readStream2buffer, deleteObject };

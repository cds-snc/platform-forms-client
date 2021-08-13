import { ReadStream } from "fs";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { UploadResult, UploadFailure, UploadSuccess } from "../../lib/types";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import formidable from "formidable";

const s3Client = new S3Client({ region: process.env.AWS_BUCKET_REGION }); // could be hard coded

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
    // setting the parameters
    const uploadParams = {
      Bucket: bucketName,
      Body: data,
      Key: `${bucketName}/user_file/${new Date().toISOString().slice(0, 10)}/${uuid()}.${filePath}`,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(uploadParams), {
      expiresIn: 3600 * 24 * 4,
    });
    const result: UploadSuccess = {
      isValid: true,
      successValue: { location: signedUrl },
    };
    return result;
  } catch (error) {
    const result: UploadFailure = { isValid: false, errorReason: error };
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
    const _buf: any[] = [];
    fileStream.on("data", (datachunk) => {
      _buf.push(datachunk);
    });
    fileStream.on("end", () => {
      resolve(Buffer.concat(_buf));
    });
    fileStream.on("error", (err) => {
      reject(err);
    });
  });
};

export { uploadFileToS3, readStream2buffer };

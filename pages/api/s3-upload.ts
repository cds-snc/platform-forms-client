import { ReadStream } from "fs";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { UploadResult, UploadFailure, UploadSuccess } from "../../lib/types";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";

const s3Client = new S3Client({ region: process.env.AWS_BUCKET_REGION });

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
    // setting the parameters
    const uploadParams = {
      Bucket: bucketName,
      Body: await readStream2buffer(fs.createReadStream(file.path)).then((data) => {
        return data;
      }),
      Key: `${bucketName}/user_file/${new Date().toISOString().slice(0, 10)}/${uuid()}.${filePath}`,
    };

    const responseData = await s3Client.send(new PutObjectCommand(uploadParams));
    const result: UploadSuccess = {
      isValid: true,
      successValue: { location: uploadParams.Key, ...responseData },
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
    const _buf = [];
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

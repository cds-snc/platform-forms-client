
import aws from "aws-sdk";
import S3 from "aws-sdk/clients/s3";
import { ReadStream } from "fs";
import formidable from "formidable";
import { v4 as uuid } from 'uuid';
import { UploadResult, UploadFailure, UploadSuccess } from "../../lib/types"

const s3 = new S3({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

/**
 * This function tries to upload a given file to aws S3 bucket and returns a data object  
 * which stores a link to the file.
 * @param file 
 * @param bucketName 
 * @param filePath 
 * @returns  {"ETag": "xxxxxxx" ,"Bucket":"temp-s3-upload-testing",  "Location":"https://temp-s3-upload-testing.s3.ca-xxxxxxx"}
 */
const uploadFileToS3 = async (file: Buffer, bucketName: string, filePath: string): Promise<UploadResult> => {
    if (!bucketName && bucketName.length === 0) {
        return new Promise<UploadResult>((resolve, reject) => {
            let result: UploadFailure = { isValid: false, errorReason: "Invalid bucket name" }
            reject(result);
        });
    }
    return new Promise<UploadResult>((resolve, reject) => {

        const uploadParams = {
            Bucket: bucketName,
            Body: file,
            Key: `${bucketName}/user_file/${Date.now()}/${uuid()}.${filePath}`
        }

        s3.upload(uploadParams, (err: any, data: any) => {
            if (err) {
                let result: UploadFailure = { isValid: false, errorReason: data }
                reject(result);
            } else {
                let result: UploadSuccess = { isValid: true, successValue: data }
                resolve(result);
            }
        },
        );
    });

};

/**
 * Read and return a Buffer object from a Stream.
 * @param mystream 
 * @returns buffer array
 */
const readStream2buffer = async (mystream: ReadStream): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {

        const _buf = Array<any>();

        mystream.on("data", datachunk => _buf.push(datachunk));
        mystream.on("end", () => resolve(Buffer.concat(_buf)));
        mystream.on("error", err => reject(`error converting stream - ${err}`));

    });

}

export { uploadFileToS3, readStream2buffer };
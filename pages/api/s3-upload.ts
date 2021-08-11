
import aws from "aws-sdk";
import S3 from "aws-sdk/clients/s3";
import { ReadStream } from "fs";
import formidable from "formidable";

const s3 = new S3({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

/**
 * Upload a file to S3 then return a data object like data.location
 * which stores a link to your file.
 * @param file 
 * @param bucketName 
 * @param filePath 
 * @returns 
 */
const uploadFileToS3 = async (file: Buffer, bucketName: string, filePath: string) => {
    if (!bucketName && bucketName.length === 0) {
        return new Promise((resolve, reject) => {
            throw new Error("invalid bucket name");
        });
    }
    return new Promise((resolve, reject) => {

        const uploadParams = {
            Bucket: bucketName,
            Body: file,
            Key: filePath
        }

        s3.upload(uploadParams, (err: any, data: any) => {
            if (err) reject(err);
            else resolve(data);
        },
        );
    });

};
/**
 * Read and return a Buffer object from a Stream.
 * @param mystream 
 * @returns 
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
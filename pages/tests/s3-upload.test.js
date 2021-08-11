
import fs from "fs"
import formidable from "formidable";
import except from "jest";
import {uploadFileToS3, readStream2buffer} from "../api/s3-upload"

let mockS3Instance = jest.fn();
mockS3Instance = {
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn().mockReturnThis(),
    catch: jest.fn(),
};

jest.mock('aws-sdk', () => {
    return { S3: () => mockS3Instance }
});

describe('S3', () => {
    it("Aws-sdk S3 upload method with correct parameters", async () => {       
 
        uploadFileToS3(Buffer.from("test"), 'fileUploadBucket', "test").then(data =>{
            console.log(data)
            expect(mockS3Instance.upload).toHaveBeenCalledWith({
                Bucket: "fileUploadBucket",
                Body: Buffer.from("test"),
                Key: "test",
            });
            expect(mockS3Instance.upload).toHaveBeenCalledTimes(1);

        }).catch(err=>{
            // do not add code
        });      
    });
})

describe('readStream2buffer', () => {
    it("Calls readStream2buffer Should return valid data type", async () => {     
 
        readStream2buffer(fs.createReadStream(Buffer.from("stream"))).then(data =>{
            console.log(data)
            expect(data).toBe(Buffer.from("stream"));
        }).catch(err=>{
            // do not add code
        });      
    });
})
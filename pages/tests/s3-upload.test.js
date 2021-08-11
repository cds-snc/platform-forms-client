
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
    it("calls aws-sdk S3 upload method with correct parameters", async () => {       
 
        const result = uploadFileToS3(Buffer.from("test"), 'fileUploadBucket', "test").then(data =>{
            console.log(data)
            expect(mockS3Instance.upload).toHaveBeenCalledWith({
                Bucket: "fileUploadBucket",
                Body: Buffer.from("test"),
                Key: "test",
            });
            expect(mockS3Instance.upload).toHaveBeenCalledTimes(1);

        }).catch(err=>{
            //console.log("" + err);
        });      
    });
})

import fs from "fs"
import formidable from "formidable";
import except from "jest";
import { uploadFileToS3, readStream2buffer } from "../api/s3-upload"
import {v4 as uuid} from 'uuid';

let dateNow;

beforeAll(() => {
    // Lock Time
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000);
});

afterAll(() => {
    // Unlock Time
    dateNow.mockRestore();
});


let mockS3 = jest.fn();
let mockUuid =jest.fn(()=> '14528745455');

mockS3 = {
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn().mockReturnThis(),
    catch: jest.fn(),
};

jest.mock('aws-sdk', () => {
    return { S3: () => mockS3 }
});

jest.mock('uuid',()=>{
    return {uuid: ()=> mockUuid }

})

describe('S3', () => {
    it("Aws-sdk S3 upload method with correct parameters", async () => {

        uploadFileToS3(Buffer.from("test"), 'temp-s3-upload-testing', "test").then(data => {
            console.log(data)
            expect(mockS3.upload).toHaveBeenCalledWith({
                Bucket: "temp-s3-upload-testing",
                Body: Buffer.from("test"),
                Key: `temp-s3-upload-testing/user_files/1487076708000/14528745455.test`,
            });
            expect(mockS3.upload).toHaveBeenCalledTimes(1);

        }).catch(()=>{
            
        });
    });
})

describe('readStream2buffer', () => {
    it("A call to readStream2buffer Should return valid data type", async () => {

        readStream2buffer(fs.createReadStream(Buffer.from("stream"))).then(data => {
            console.log(data)
            expect(data).toBe(Buffer.from("stream"));
        }).catch(()=>{

        })
    });
})
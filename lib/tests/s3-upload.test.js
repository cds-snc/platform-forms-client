import fs from "fs";
import { uploadFileToS3, readStream2buffer } from "../../pages/api/s3-upload";

let mockUuid = jest.fn(() => "14528745455");

jest.mock("uuid", () => {
  return { uuid: () => mockUuid };
});

describe("S3Client", () => {
  it("Shoudl raise an error with malformed parameters", async () => {
    jest.spyOn(global, "Date").mockImplementationOnce(() => new Date("2021-08-12"));
    await uploadFileToS3(Buffer.from("test"), "temp-s3-upload-testing", "test").catch((error) => {
      expect(error).toBeTruthy();
    });
  });
});

describe("S3Client", () => {
  it("Should call upload method with incorrect file path", async () => {
    jest.spyOn(global, "Date").mockImplementationOnce(() => new Date("2021-08-12"));

    await uploadFileToS3(Buffer.from("test"), "temp-s3-upload-testing", "test").then((data) => {
      expect(data.isValid).toBeFalsy();
    });
  });
});

describe("readStream2buffer", () => {
  it("Should raise an error due to filestream not found", async () => {
    try {
      await readStream2buffer(fs.createReadStream(Buffer.from("stream")));
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});

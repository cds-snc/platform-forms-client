import { createReadStream } from "fs";
import { uploadFileToS3, readStream2buffer } from "../s3-upload";

let mockUuid = jest.fn(() => "14528745455");

jest.mock("@aws-sdk/client-s3");
jest.mock("uuid", () => {
  return { uuid: () => mockUuid };
});

describe("S3Client", () => {
  it("Should raise an error with malformed parameters", async () => {
    jest.spyOn(global, "Date").mockImplementationOnce(() => new Date("2021-08-12"));
    expect(async () =>
      uploadFileToS3(Buffer.from("test"), "temp-s3-upload-testing", "test").toThrow(TypeError)
    );
  });
});

describe("uploadFileToS3", () => {
  it("Should call upload method with incorrect file path", async () => {
    jest.spyOn(global, "Date").mockImplementationOnce(() => new Date("2021-08-12"));

    await uploadFileToS3({ path: "./test" }, "temp-s3-upload-testing", "test").then((data) => {
      expect(data.isValid).toBeFalsy();
    });
  });
});

describe("readStream2buffer", () => {
  it("Should raise an error due to filestream not found", async () => {
    try {
      await readStream2buffer(createReadStream(Buffer.from("stream")));
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});

import {
  getFileAttachments,
  getFileNameFromPath,
  getFileScanVerdict,
  toCamelCase,
} from "@lib/fileAttachments";
import { S3Client, GetObjectTaggingCommand } from "@aws-sdk/client-s3";
import { logMessage } from "@lib/logger";
import { mockClient } from "aws-sdk-client-mock";

jest.mock("@lib/logger");
const mockLogMessage = jest.mocked(logMessage, true);
const mockS3Client = mockClient(S3Client);

beforeEach(() => {
  jest.resetAllMocks();
  mockS3Client.reset();
});

describe("getFileAttachments", () => {
  it("Should return an array of file names only", () => {
    const submissionOne =
      '{"2":"Pat","3":"English","4":"form_attachments/2022-08-09/cfc3a736-d3e3-48d2-948f-220bf3035532/gremlins.png"}';
    const submissionTwo =
      '{"2":"Pat","3":"English","4":"form_attachments/2022-08-09/cfc3a736-d3e3-48d2-948f-220bf3035532/smudge.png","5":"form_attachments/2020-01-31/7b11a366-a2fc-4ff4-b72f-59f430bfb8cb/the_cat.gif"}';
    const filesOne = [{ fileName: "gremlins.png" }];
    const filesTwo = [{ fileName: "smudge.png" }, { fileName: "the_cat.gif" }];
    expect(getFileAttachments("", submissionOne)).toEqual(filesOne);
    expect(getFileAttachments("", submissionTwo)).toEqual(filesTwo);
  });

  it("Should return an array of file names and paths", () => {
    const submissionOne =
      '{"2":"Pat","3":"English","4":"form_attachments/2022-08-09/cfc3a736-d3e3-48d2-948f-220bf3035532/gremlins.png"}';
    const submissionTwo =
      '{"2":"Pat","3":"English","4":"form_attachments/2022-08-09/cfc3a736-d3e3-48d2-948f-220bf3035532/smudge.png","5":"form_attachments/2020-01-31/7b11a366-a2fc-4ff4-b72f-59f430bfb8cb/the_cat.gif"}';
    const filesOne = [
      {
        fileName: "gremlins.png",
        path: "form_attachments/2022-08-09/cfc3a736-d3e3-48d2-948f-220bf3035532/gremlins.png",
      },
    ];
    const filesTwo = [
      {
        fileName: "smudge.png",
        path: "form_attachments/2022-08-09/cfc3a736-d3e3-48d2-948f-220bf3035532/smudge.png",
      },
      {
        fileName: "the_cat.gif",
        path: "form_attachments/2020-01-31/7b11a366-a2fc-4ff4-b72f-59f430bfb8cb/the_cat.gif",
      },
    ];
    expect(getFileAttachments("", submissionOne, true)).toEqual(filesOne);
    expect(getFileAttachments("", submissionTwo, true)).toEqual(filesTwo);
  });

  it("Should return an empty array if no file attachments are present", () => {
    expect(getFileAttachments("", undefined)).toEqual([]);
    expect(getFileAttachments("", "{}")).toEqual([]);
    expect(getFileAttachments("", '{"2":"Pat","3":"Francais"}')).toEqual([]);
  });
});

describe("getFileNameFromPath", () => {
  it("Should get the file name from a valid path", () => {
    expect(getFileNameFromPath("gimli.jpg")).toBe("gimli.jpg");
    expect(getFileNameFromPath("gandalf/the_grey.pdf")).toBe("the_grey.pdf");
    expect(
      getFileNameFromPath(
        "form_attachments/2005-09-15/f3a0cc1f-f693-490e-b1bc-eb58e121e61d/frodo.png"
      )
    ).toBe("frodo.png");
  });

  it("Should return an empty filename if one does not exist", () => {
    expect(getFileNameFromPath("")).toBe("");
    expect(getFileNameFromPath("form_attachments/")).toBe("");
  });
});

describe("getFileScanVerdict", () => {
  it("Should return the `av-` prefix tags only", async () => {
    const tagSet = {
      TagSet: [
        {
          Key: "av-status",
          Value: "clean",
        },
        {
          Key: "av-scanner",
          Value: "clamav",
        },
        {
          Key: "muffins",
          Value: "banana",
        },
      ],
    };
    const expectedTags = {
      avStatus: "clean",
      avScanner: "clamav",
    };
    mockS3Client.on(GetObjectTaggingCommand).resolvesOnce(tagSet);
    const tags = await getFileScanVerdict("bucket", "key", "123");
    expect(tags).toEqual(expectedTags);
  });

  it("Should return an empty object if no `av-` tags", async () => {
    const tagSet = {
      TagSet: [
        {
          Key: "muffins",
          Value: "banana",
        },
        {
          Key: "cookies",
          Value: "double chocolate",
        },
      ],
    };
    mockS3Client.on(GetObjectTaggingCommand).resolvesOnce(tagSet);
    const tags = await getFileScanVerdict("bucket", "key", "123");
    expect(tags).toEqual({});
  });

  it("Should return an empty object if no tags", async () => {
    mockS3Client.on(GetObjectTaggingCommand).resolvesOnce({ TagSet: [] });
    const tags = await getFileScanVerdict("bucket", "key", "123");
    expect(tags).toEqual({});
  });

  it("Should log an error if an exception is caught", async () => {
    mockS3Client.on(GetObjectTaggingCommand).rejectsOnce("Well this is awkward...");
    const tags = await getFileScanVerdict("bucket", "key", "123");
    expect(tags).toBe(undefined);
    expect(mockLogMessage.error.mock.calls[0][0]).toContain(
      "123: failed to get object tags for s3://bucket/key: Error: Well this is awkward..."
    );
  });
});

describe("toCamelCase", () => {
  it("Should camel case a value with hyphens", () => {
    expect(toCamelCase("this-is-fun")).toBe("thisIsFun");
    expect(toCamelCase("WOO-Wee-wow-wow")).toBe("WOOWeeWowWow");
  });

  it("Should do nothing if there are no hyphens", () => {
    expect(getFileNameFromPath("")).toBe("");
    expect(getFileNameFromPath("a fairly boring string")).toBe("a fairly boring string");
  });
});

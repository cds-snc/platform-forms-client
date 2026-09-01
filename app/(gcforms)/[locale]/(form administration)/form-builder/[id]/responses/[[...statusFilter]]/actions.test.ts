import { describe, expect, it } from "vitest";
import { getSubmissionData } from "./submissionData";

const attachment = {
  id: "file-1",
  name: "document.pdf",
  downloadLink: "https://example.test/document.pdf",
};

describe("getSubmissionData", () => {
  it("collects downloadable attachments from explicit attachment sources", () => {
    const result = getSubmissionData(
      JSON.stringify({
        answers: {
          "1": { id: "file-1", name: "document.pdf", size: 123 },
        },
        attachments: [attachment],
      }),
      [{ ...attachment, downloadLink: "https://example.test/signed-document.pdf" }]
    );

    expect(result.attachments).toEqual([
      { ...attachment, downloadLink: "https://example.test/signed-document.pdf" },
    ]);
  });

  it("does not treat file answers as downloadable attachments", () => {
    const result = getSubmissionData({
      answers: {
        "1": { id: "file-1", name: "document.pdf", size: 123 },
      },
    });

    expect(result.attachments).toEqual([]);
  });
});

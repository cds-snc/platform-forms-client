import { getFileAttachments, getFileNameFromPath } from "@lib/fileAttachments";

describe("getFileAttachments", () => {
  it("Should return an array of file attachments", () => {
    const submissionOne =
      '{"2":"Pat","3":"English","4":"form_attachments/2022-08-09/cfc3a736-d3e3-48d2-948f-220bf3035532/gremlins.png"}';
    const submissionTwo =
      '{"2":"Pat","3":"English","4":"form_attachments/2022-08-09/cfc3a736-d3e3-48d2-948f-220bf3035532/smudge.png","5":"form_attachments/2020-01-31/7b11a366-a2fc-4ff4-b72f-59f430bfb8cb/the_cat.gif"}';
    const filesOne = [{ fileName: "gremlins.png" }];
    const filesTwo = [{ fileName: "smudge.png" }, { fileName: "the_cat.gif" }];
    expect(getFileAttachments("", submissionOne)).toEqual(filesOne);
    expect(getFileAttachments("", submissionTwo)).toEqual(filesTwo);
  });

  it("Should return an empty array if no file attachments are present", () => {
    expect(getFileAttachments("", "{}")).toEqual([]);
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

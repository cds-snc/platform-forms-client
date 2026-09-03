/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadSingleButton } from "./DownloadSingleButton";
import { getSubmissionsByFormat } from "../actions";

vi.mock("../actions", () => ({
  getSubmissionsByFormat: vi.fn(),
}));

const mockedGetSubmissionsByFormat = vi.mocked(getSubmissionsByFormat);

const renderButton = () =>
  render(
    <DownloadSingleButton
      id="download-response-1"
      formId="form-1"
      responseId="response-1"
      setDownloadError={vi.fn()}
      onDownloadSuccess={vi.fn()}
      ariaLabelledBy="response-label-1"
    />
  );

describe("DownloadSingleButton", () => {
  beforeEach(() => {
    mockedGetSubmissionsByFormat.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        blob: async () => new Blob(["attachment contents"]),
      })
    );
    vi.spyOn(window.URL, "createObjectURL").mockImplementation(() => "blob:test");
    vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("downloads only the HTML response when attachments are present", async () => {
    const submission = {
      id: "response-1",
      created_at: 1,
      html: "<p>Response</p>",
      attachments: [
        {
          id: "attachment-1",
          name: "document.pdf",
          downloadLink: "https://example.test/document.pdf",
        },
      ],
    };
    mockedGetSubmissionsByFormat.mockResolvedValue([submission]);
    const createObjectURL = vi.mocked(window.URL.createObjectURL);

    renderButton();
    fireEvent.click(document.getElementById("download-response-1") as HTMLElement);

    await waitFor(() => expect(window.URL.createObjectURL).toHaveBeenCalledOnce());

    const downloadedBlob = createObjectURL.mock.calls[0][0] as Blob;
    expect(downloadedBlob).toBeInstanceOf(Blob);
    expect(downloadedBlob.type).toBe("");
    expect(downloadedBlob.size).toBe(new Blob([submission.html]).size);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("downloads the HTML response when attachments are absent", async () => {
    mockedGetSubmissionsByFormat.mockResolvedValue([
      { id: "response-1", created_at: 1, html: "<p>Response</p>" },
    ]);

    renderButton();
    fireEvent.click(document.getElementById("download-response-1") as HTMLElement);

    await waitFor(() => expect(window.URL.createObjectURL).toHaveBeenCalledOnce());
  });
});

/**
 * @vitest-environment jsdom
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Upload } from "./Upload";

const {
  pushMock,
  saveSessionProgressMock,
  toastErrorMock,
  logClientErrorMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  saveSessionProgressMock: vi.fn(),
  toastErrorMock: vi.fn(),
  logClientErrorMock: vi.fn(),
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@lib/utils/saveSessionProgress", () => ({
  saveSessionProgress: saveSessionProgressMock,
}));

vi.mock("@formBuilder/components/shared/Toast", () => ({
  toast: {
    error: toastErrorMock,
  },
}));

vi.mock("@lib/hooks/LogClient/useLogClient", () => ({
  useLogClient: () => ({
    logClientError: logClientErrorMock,
  }),
}));

vi.mock("@serverComponents/icons/ResumeUploadIcon", () => ({
  ResumeUploadIcon: ({ className }: { className?: string }) => <div className={className} />,
}));

let mockFileContents = "";

class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsText() {
    queueMicrotask(() => {
      this.onload?.({ target: { result: mockFileContents } } as ProgressEvent<FileReader>);
    });
  }
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "true");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

const createSavedFormFile = (data: { id: string; values: Record<string, string> }) => {
  const encodedData = Buffer.from(
    JSON.stringify({
      id: data.id,
      values: data.values,
      history: ["start"],
      currentGroup: "start",
    }),
    "utf8"
  ).toString("base64");

  return `<!doctype html><html><body><div id="form-data">${JSON.stringify({ data: encodedData })}</div></body></html>`;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFileContents = "";
  vi.stubGlobal("FileReader", MockFileReader as unknown as typeof FileReader);
});

describe("Upload", () => {
  it("loads mismatched saved answers into the current form when continuing anyway", async () => {
    const user = userEvent.setup();
    mockFileContents = createSavedFormFile({
      id: "previous-form",
      values: { firstName: "Avery" },
    });

    const { container } = render(<Upload formId="current-form" />);
    const input = container.querySelector("#file-upload");

    expect(input).not.toBeNull();

    await user.upload(input as HTMLInputElement, new File(["resume"], "resume.html"));

    expect(
      await screen.findByText("saveAndResume.resumePage.mismatchedForm.title")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "saveAndResume.resumePage.mismatchedForm.matchingFormLink",
      })
    ).toHaveAttribute("href", "/en/id/previous-form/resume");

    await user.click(screen.getByRole("button", { name: "saveAndResume.resumePage.mismatchedForm.continue" }));

    await waitFor(() => {
      expect(saveSessionProgressMock).toHaveBeenCalledWith("en", {
        id: "current-form",
        values: { firstName: "Avery" },
        history: ["start"],
        currentGroup: "start",
      });
    });

    expect(pushMock).toHaveBeenCalledWith("/en/id/current-form");
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(logClientErrorMock).not.toHaveBeenCalled();
  });
});
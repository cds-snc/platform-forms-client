/**
 * @vitest-environment jsdom
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Upload } from "./Upload";

const { pushMock, saveSessionProgressMock, toastErrorMock, logClientErrorMock } = vi.hoisted(
  () => ({
    pushMock: vi.fn(),
    saveSessionProgressMock: vi.fn(),
    toastErrorMock: vi.fn(),
    logClientErrorMock: vi.fn(),
  })
);

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@lib/hooks/useResponseCache", () => ({
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

    await user.click(
      screen.getByRole("button", { name: "saveAndResume.resumePage.mismatchedForm.continue" })
    );

    await waitFor(() => {
      expect(saveSessionProgressMock).toHaveBeenCalledWith({
        language: "en",
        id: "previous-form",
        values: { firstName: "Avery" },
        history: ["start"],
        currentGroup: "start",
        restoredForm: true,
      });
    });

    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(logClientErrorMock).not.toHaveBeenCalled();
  });

  it("shows drag feedback and restores progress from a dropped file", async () => {
    mockFileContents = createSavedFormFile({
      id: "current-form",
      values: { firstName: "Avery" },
    });

    render(<Upload formId="current-form" />);

    const hotspot = screen.getByRole("button", {
      name: "saveAndResume.resumePage.upload.title",
    });
    const droppedFile = new File(["resume"], "resume.html", { type: "text/html" });

    expect(hotspot).toHaveClass("min-h-50");
    expect(hotspot).toHaveAttribute("aria-pressed", "false");

    const dragData = {
      dataTransfer: {
        files: [droppedFile],
      },
    };

    fireEvent.dragEnter(hotspot, dragData);
    fireEvent.dragOver(hotspot, dragData);

    expect(hotspot).toHaveClass("bg-violet-200");
    expect(hotspot).toHaveAttribute("aria-pressed", "true");

    fireEvent.drop(hotspot, dragData);

    await waitFor(() => {
      expect(saveSessionProgressMock).toHaveBeenCalledWith({
        id: "current-form",
        values: { firstName: "Avery" },
        history: ["start"],
        language: "en",
        currentGroup: "start",
        restoredForm: true,
      });
    });

    expect(hotspot).toHaveClass("min-h-50");
    expect(hotspot).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps the drag state active while moving within the hotspot", () => {
    vi.useFakeTimers();

    render(<Upload formId="current-form" />);

    const hotspot = screen.getByRole("button", {
      name: "saveAndResume.resumePage.upload.title",
    });
    const description = screen.getByText("saveAndResume.resumePage.upload.description");

    fireEvent.dragEnter(hotspot, {
      dataTransfer: {
        files: [new File(["resume"], "resume.html", { type: "text/html" })],
      },
    });
    fireEvent.dragOver(hotspot, {
      dataTransfer: {
        files: [new File(["resume"], "resume.html", { type: "text/html" })],
      },
    });

    expect(hotspot).toHaveAttribute("aria-pressed", "true");

    const dragLeaveWithinHotspot = createEvent.dragLeave(hotspot);
    Object.defineProperty(dragLeaveWithinHotspot, "relatedTarget", {
      value: description,
    });

    fireEvent(hotspot, dragLeaveWithinHotspot);

    expect(hotspot).toHaveAttribute("aria-pressed", "true");

    const dragLeaveHotspot = createEvent.dragLeave(hotspot);
    Object.defineProperty(dragLeaveHotspot, "relatedTarget", {
      value: document.body,
    });

    fireEvent(hotspot, dragLeaveHotspot);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(hotspot).toHaveAttribute("aria-pressed", "false");

    vi.useRealTimers();
  });
});

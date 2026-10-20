import React from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DownloadDialog } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses/[[...statusFilter]]/components/Dialogs/DownloadDialog";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.css";

const { mockFileUploadEnabled } = vi.hoisted(() => ({
  mockFileUploadEnabled: vi.fn(() => false),
}));

vi.mock("@lib/hooks/useFeatureFlags", () => ({
  useFeatureFlags: () => ({ getFlag: mockFileUploadEnabled }),
}));

vi.mock(
  "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses/[[...statusFilter]]/actions",
  () => ({
    getSubmissionsByFormat: vi.fn(),
  })
);

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

const defaultProps = {
  checkedItems: new Map<string, boolean>([
    ["response-1", true],
    ["response-2", true],
  ]),
  isDialogVisible: true,
  setIsDialogVisible: vi.fn(),
  setDownloadError: vi.fn(),
  formId: "form-id",
  formName: "Test form",
  onSuccessfulDownload: vi.fn(),
  responseDownloadLimit: 50,
};

describe("<DownloadDialog />", () => {
  beforeAll(() => {
    setupFonts();
  });

  beforeEach(() => {
    mockFileUploadEnabled.mockReturnValue(false);
  });

  it("does not render the version selector when versions are not provided", async () => {
    await render(<DownloadDialog {...defaultProps} />);

    const selectors = await page.getByTestId("download-dialog-version-filter").all();
    expect(selectors).toHaveLength(0);
  });

  it("offers an optional ZIP checkbox when file uploads are disabled", async () => {
    await render(<DownloadDialog {...defaultProps} />);

    await expect.element(page.getByRole("checkbox")).toBeVisible();
  });

  it("hides the optional ZIP checkbox when file uploads are enabled", async () => {
    mockFileUploadEnabled.mockReturnValue(true);
    await render(<DownloadDialog {...defaultProps} />);

    const checkboxes = await page.getByRole("checkbox").all();
    expect(checkboxes).toHaveLength(0);
  });

  it("does not render the version selector when all matched versions are the same", async () => {
    await render(
      <DownloadDialog
        {...defaultProps}
        checkedMeta={[
          { name: "response-1", version: "v1" },
          { name: "response-2", version: "v1" },
        ]}
      />
    );

    const selectors = await page.getByTestId("download-dialog-version-filter").all();
    expect(selectors).toHaveLength(0);
  });

  it("does not render the version selector when all versions are missing", async () => {
    await render(
      <DownloadDialog
        {...defaultProps}
        checkedMeta={[
          { name: "response-1", version: null },
          { name: "response-2", version: null },
        ]}
      />
    );

    const selectors = await page.getByTestId("download-dialog-version-filter").all();
    expect(selectors).toHaveLength(0);
  });

  it("renders the version selector and requires a selection when multiple versions are available", async () => {
    await render(
      <DownloadDialog
        {...defaultProps}
        checkedMeta={[
          { name: "response-1", version: "v1" },
          { name: "response-2", version: "v2" },
        ]}
      />
    );

    const versionSelector = page.getByTestId("download-dialog-version-filter");
    await expect.element(versionSelector).toBeVisible();

    const downloadButton = page.getByRole("button", {
      name: "downloadResponsesModals.downloadDialog.download",
    });
    await expect.element(downloadButton).toBeDisabled();

    await userEvent.selectOptions(versionSelector.element(), "v2");

    await expect.element(downloadButton).toBeEnabled();
  });
});

import React from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DownloadDialog } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses/[[...statusFilter]]/components/Dialogs/DownloadDialog/DownloadDialog";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.css";

const { mockFileUploadEnabled, mockDownloadResponses, mockLanguage } = vi.hoisted(() => ({
  mockFileUploadEnabled: vi.fn(() => false),
  mockDownloadResponses: vi.fn(),
  mockLanguage: vi.fn(() => "en"),
}));

vi.mock("@lib/hooks/useFeatureFlags", () => ({
  useFeatureFlags: () => ({ getFlag: mockFileUploadEnabled }),
}));

vi.mock(
  "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses/[[...statusFilter]]/components/Dialogs/DownloadDialog/downloadResponses",
  () => ({ downloadResponses: mockDownloadResponses })
);

vi.mock(
  "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses/[[...statusFilter]]/actions",
  () => ({
    getSubmissionsByFormat: vi.fn(),
  })
);

vi.mock("@i18n/client", async () => {
  const { createInstance } = await import("i18next");
  const { default: en } = await import("@root/i18n/translations/en/form-builder-responses.json");
  const { default: fr } = await import("@root/i18n/translations/fr/form-builder-responses.json");
  const i18n = createInstance();
  await i18n.init({
    lng: "en",
    resources: { en: { translation: en }, fr: { translation: fr } },
  });

  return {
    useTranslation: () => ({
      t: i18n.getFixedT(mockLanguage()),
      i18n: { language: mockLanguage() },
    }),
  };
});

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
  responsesDownloadZipMaxSizeMB: 500,
};

describe("<DownloadDialog />", () => {
  beforeAll(() => {
    setupFonts();
  });

  beforeEach(() => {
    mockFileUploadEnabled.mockReturnValue(false);
    mockDownloadResponses.mockReset();
    mockLanguage.mockReturnValue("en");
  });

  it.each([
    ["en", "Maximum 125 MB at one time. Select smaller batches if the download fails."],
    [
      "fr",
      "Maximum 125 Mo à la fois. Sélectionnez de plus petits lots si le téléchargement échoue.",
    ],
  ])("shows the configured download size limit in %s", async (language, message) => {
    mockLanguage.mockReturnValue(language);
    mockFileUploadEnabled.mockReturnValue(true);
    await render(<DownloadDialog {...defaultProps} responsesDownloadZipMaxSizeMB={125} />);

    await expect.element(page.getByText(message)).toBeVisible();
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

  it("shows a generic loading status when file uploads are disabled", async () => {
    mockDownloadResponses.mockImplementationOnce(
      async (options: {
        setDownloadProgress: (progress: {
          phase: "responses";
          response: number;
          total: number;
        }) => void;
      }) => {
        options.setDownloadProgress({ phase: "responses", response: 1, total: 2 });
      }
    );
    await render(
      <DownloadDialog
        {...defaultProps}
        checkedMeta={[
          { name: "response-1", version: "v1" },
          { name: "response-2", version: "v1" },
        ]}
      />
    );

    await userEvent.click(page.getByRole("button", { name: "Download", exact: true }));

    expect(mockDownloadResponses).toHaveBeenCalledOnce();
    await expect.element(page.getByRole("status")).toHaveTextContent("Loading...");
    await expect.element(page.getByRole("status")).not.toHaveTextContent("Processing response");
    await expect.element(page.getByTestId("download-progress-indicator")).toBeVisible();
  });

  it("shows progress status when file uploads are enabled", async () => {
    mockFileUploadEnabled.mockReturnValue(true);
    mockDownloadResponses.mockImplementationOnce(
      async (options: {
        setDownloadProgress: (progress: {
          phase: "responses";
          response: number;
          total: number;
        }) => void;
      }) => {
        options.setDownloadProgress({ phase: "responses", response: 1, total: 2 });
      }
    );
    await render(
      <DownloadDialog
        {...defaultProps}
        checkedMeta={[
          { name: "response-1", version: "v1" },
          { name: "response-2", version: "v1" },
        ]}
      />
    );

    await userEvent.click(page.getByRole("button", { name: "Download", exact: true }));

    expect(mockDownloadResponses).toHaveBeenCalledOnce();
    await expect.element(page.getByRole("status")).toBeVisible();
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
      name: "Download",
      exact: true,
    });
    await expect.element(downloadButton).toBeDisabled();

    await userEvent.selectOptions(versionSelector.element(), "v2");

    await expect.element(downloadButton).toBeEnabled();
  });
});

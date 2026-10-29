import React from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DownloadDialog } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses/[[...statusFilter]]/components/Dialogs/DownloadDialog/DownloadDialog";
import { setupFonts } from "../../helpers/setupFonts";
import type {
  DownloadProgress,
  DownloadResponsesOptions,
} from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses/[[...statusFilter]]/components/Dialogs/DownloadDialog/DownloadDialog.types";

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

  it("announces response progress when file uploads are disabled", async () => {
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
    await expect.element(page.getByRole("status")).toHaveTextContent("Processing response 1 of 2");
    await expect.element(page.getByTestId("download-progress-indicator")).toBeVisible();
  });

  it("keeps detailed progress outside the mounted live region", async () => {
    mockFileUploadEnabled.mockReturnValue(true);
    let updateProgress: ((progress: DownloadProgress) => void) | undefined;
    mockDownloadResponses.mockImplementationOnce(
      async (options: { setDownloadProgress: (progress: DownloadProgress) => void }) => {
        updateProgress = options.setDownloadProgress;
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

    const status = page.getByRole("status");
    const statusElement = status.element();
    await expect.element(status).toHaveTextContent("");
    await expect.element(status).toHaveAttribute("aria-atomic", "true");

    await userEvent.click(page.getByRole("button", { name: "Download", exact: true }));
    expect(mockDownloadResponses).toHaveBeenCalledOnce();
    expect(status.element()).toBe(statusElement);
    expect(await page.getByRole("status").all()).toHaveLength(1);
    await expect.element(status).toHaveTextContent("Processing response 1 of 2");
    await expect
      .element(page.getByTestId("download-progress-indicator"))
      .not.toHaveAttribute("aria-live");

    expect(updateProgress).toBeDefined();
    updateProgress!({
      phase: "attachments",
      response: 1,
      responseTotal: 2,
      completed: 0,
      total: 3,
    });
    await expect.element(status).toHaveTextContent("");
    await expect
      .element(page.getByText("Downloading attachment 1 of 3", { exact: true }))
      .toBeVisible();

    updateProgress!({ phase: "zip", percent: 42 });
    await expect.element(status).toHaveTextContent("");
    await expect
      .element(page.getByTestId("download-progress-indicator"))
      .toHaveTextContent("Loading...Creating ZIP: 42%");
  });

  it.each([
    { language: "en", warnings: undefined, message: "Download complete." },
    { language: "fr", warnings: undefined, message: "Téléchargement terminé." },
    {
      language: "en",
      warnings: { sizeLimitReached: true, processingFailed: false },
      message: "Could not download all responses or attachments",
    },
    {
      language: "en",
      warnings: { sizeLimitReached: false, processingFailed: true },
      message: "Could not download all responses or attachments",
    },
  ])(
    "sets completion text without changing auto-close: $message",
    async ({ language, warnings, message }) => {
      mockLanguage.mockReturnValue(language);
      mockDownloadResponses.mockImplementationOnce(async (options: DownloadResponsesOptions) => {
        options.onDownloadComplete(["response-1"], warnings);
      });
      const setIsDialogVisible = vi.fn();
      const onSuccessfulDownload = vi.fn();
      await render(
        <DownloadDialog
          {...defaultProps}
          setIsDialogVisible={setIsDialogVisible}
          onSuccessfulDownload={onSuccessfulDownload}
          checkedMeta={[
            { name: "response-1", version: "v1" },
            { name: "response-2", version: "v1" },
          ]}
        />
      );
      await userEvent.click(
        page.getByRole("button", {
          name: language === "fr" ? "Télécharger" : "Download",
          exact: true,
        })
      );
      await expect
        .element(page.getByTestId("download-progress-indicator-hidden"))
        .toHaveTextContent(message);
      expect(onSuccessfulDownload).toHaveBeenCalledWith(["response-1"], warnings);
      expect(setIsDialogVisible).toHaveBeenCalledWith(false);
      await expect.element(page.getByTestId("dialog")).not.toHaveAttribute("open");
    }
  );

  it("clears completed progress when the dialog is reopened", async () => {
    mockDownloadResponses.mockImplementationOnce(async (options: DownloadResponsesOptions) => {
      options.onDownloadComplete(["response-1"]);
    });
    const Harness = () => {
      const [visible, setVisible] = React.useState(true);
      return (
        <>
          <button onClick={() => setVisible(true)}>Open download dialog</button>
          <DownloadDialog
            {...defaultProps}
            isDialogVisible={visible}
            setIsDialogVisible={setVisible}
            checkedMeta={[
              { name: "response-1", version: "v1" },
              { name: "response-2", version: "v1" },
            ]}
          />
        </>
      );
    };
    await render(<Harness />);
    await userEvent.click(page.getByRole("button", { name: "Download", exact: true }));
    await expect.element(page.getByTestId("dialog")).not.toBeInTheDocument();
    await userEvent.click(page.getByRole("button", { name: "Open download dialog" }));
    await expect.element(page.getByRole("status")).toHaveTextContent("");
    await expect.element(page.getByRole("button", { name: "Download", exact: true })).toBeEnabled();
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

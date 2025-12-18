import { describe, it, expect } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "./testUtils";
import {
  CsvDirectory,
  HtmlDirectory,
} from "@responses-pilot/components/folder-preview/DirectoryPreview";
import {
  HTML_DOWNLOAD_FOLDER,
  SOURCE_FOLDER,
  LOGS_FOLDER,
  RAW_RESPONSE_FOLDER,
} from "@responses-pilot/lib/constants";

import "@root/styles/app.scss";

describe("<CsvDirectory />", () => {
  it("renders with default filename", async () => {
    await render(<CsvDirectory filename="example.csv" />);

    const filename = page.getByText("example.csv");
    await expect.element(filename).toBeVisible();
  });

  it("renders with custom filename", async () => {
    await render(<CsvDirectory filename="custom-form.csv" />);

    const filename = page.getByText("custom-form.csv");
    await expect.element(filename).toBeVisible();
  });

  it("shows attachments directory when showAttachments is true", async () => {
    await render(<CsvDirectory filename="example.csv" showAttachments={true} />);

    const attachmentsDirectory = page.getByTestId("attachments-directory");
    await expect.element(attachmentsDirectory).toBeVisible();
  });

  it("always shows source directory", async () => {
    await render(<CsvDirectory filename="example.csv" showAttachments={false} />);

    const sourceFolder = page.getByText(SOURCE_FOLDER);
    await expect.element(sourceFolder).toBeVisible();

    const logsFolder = page.getByText(LOGS_FOLDER);
    await expect.element(logsFolder).toBeVisible();

    const rawResponseFolder = page.getByText(RAW_RESPONSE_FOLDER);
    await expect.element(rawResponseFolder).toBeVisible();
  });
});

describe("<HtmlDirectory />", () => {
  it("renders HTML directory structure", async () => {
    await render(<HtmlDirectory showAttachments={true} />);

    const htmlDownloadFolder = page.getByText(HTML_DOWNLOAD_FOLDER);
    await expect.element(htmlDownloadFolder).toBeVisible();
  });

  it("shows attachments directory when showAttachments is true", async () => {
    await render(<HtmlDirectory showAttachments={true} />);

    const attachmentsDirectory = page.getByTestId("attachments-directory");
    await expect.element(attachmentsDirectory).toBeVisible();
  });

  it("always shows source directory", async () => {
    await render(<HtmlDirectory showAttachments={false} />);

    const sourceFolder = page.getByText(SOURCE_FOLDER);
    await expect.element(sourceFolder).toBeVisible();

    const logsFolder = page.getByText(LOGS_FOLDER);
    await expect.element(logsFolder).toBeVisible();

    const rawResponseFolder = page.getByText(RAW_RESPONSE_FOLDER);
    await expect.element(rawResponseFolder).toBeVisible();
  });
});

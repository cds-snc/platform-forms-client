import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DownloadTable } from "@formBuilder/[id]/responses/[[...statusFilter]]/components/DownloadTable";
import { StatusFilter } from "@formBuilder/[id]/responses/[[...statusFilter]]/types";
import { VaultStatus, type VaultSubmissionOverview } from "@lib/types";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.css";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/en/form-builder/test-form/responses/new",
  useParams: () => ({ statusFilter: [] }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("@formBuilder/[id]/responses/[[...statusFilter]]/actions", () => ({
  getSubmissionsByFormat: vi.fn(),
  getSubmissionRemovalDate: vi.fn().mockResolvedValue(Date.now() + 30 * 86400000),
}));

vi.mock(
  "@formBuilder/[id]/responses/[[...statusFilter]]/components/Dialogs/DownloadDialog/DownloadDialog",
  () => ({
    DownloadDialog: ({ checkedItems }: { checkedItems: Map<string, boolean> }) => (
      <output data-testid="selected-response-ids">{[...checkedItems.keys()].join(",")}</output>
    ),
  })
);

vi.mock(
  "@formBuilder/[id]/responses/[[...statusFilter]]/components/Dialogs/ConfirmDeleteNewDialog",
  () => ({ ConfirmDeleteNewDialog: () => null })
);

vi.mock("@i18n/client", async () => {
  const { createInstance } = await import("i18next");
  const { default: builder } = await import("@root/i18n/translations/en/form-builder.json");
  const { default: responses } =
    await import("@root/i18n/translations/en/form-builder-responses.json");
  const i18n = createInstance();
  await i18n.init({
    lng: "en",
    resources: { en: { "form-builder": builder, "form-builder-responses": responses } },
  });
  return {
    useTranslation: (namespace: string) => ({
      t: i18n.getFixedT("en", namespace),
      i18n: { language: "en" },
    }),
  };
});

const makeResponse = (name: string, status: VaultStatus, age: number): VaultSubmissionOverview => ({
  formID: "test-form",
  name,
  status,
  createdAt: Date.now() - age * 86400000,
  version: "1",
});

const defaultProps = {
  formId: "test-form",
  formName: "Nagware browser fixture",
  responseDownloadLimit: 20,
  responsesDownloadZipMaxSizeMB: 500,
  startFromExclusiveResponse: null,
  overdueAfter: 15,
  nagwarePromptAfter: 21,
  nagwareWarnAfter: 35,
  nagwareEnabled: true,
};

describe("<DownloadTable /> nagware states", () => {
  beforeAll(setupFonts);

  it.each([
    { age: 21, status: VaultStatus.NEW, title: null, blocked: false },
    { age: 22, status: VaultStatus.NEW, title: "Retrieve responses", blocked: false },
    {
      age: 22,
      status: VaultStatus.DOWNLOADED,
      title: "Sign off on the removal of responses from GC Forms",
      blocked: false,
    },
    { age: 35, status: VaultStatus.NEW, title: "Retrieve responses", blocked: false },
    {
      age: 36,
      status: VaultStatus.NEW,
      title: "Downloading is restricted to overdue responses until they are retrieved",
      blocked: true,
    },
    {
      age: 36,
      status: VaultStatus.DOWNLOADED,
      title: "Downloading is restricted until responses are signed off for removal",
      blocked: false,
    },
    { age: 36, status: VaultStatus.CONFIRMED, title: null, blocked: false },
  ])("renders the $status state at $age days", async ({ age, status, title, blocked }) => {
    const statusFilter =
      status === VaultStatus.DOWNLOADED
        ? StatusFilter.DOWNLOADED
        : status === VaultStatus.CONFIRMED
          ? StatusFilter.CONFIRMED
          : StatusFilter.NEW;
    await render(
      <DownloadTable
        {...defaultProps}
        statusFilter={statusFilter}
        vaultSubmissions={[
          makeResponse("old-response", status, age),
          makeResponse("fresh-response", status, 1),
        ]}
      />
    );

    if (title) {
      await expect
        .element(page.getByRole("alert").getByRole("heading", { name: title, exact: true }))
        .toBeVisible();
      await expect.element(page.getByTestId("numberOfSubmissions")).toHaveTextContent("1");
      expect(page.getByRole("alert").element().className).toContain(
        age > 35 ? "bg-red-50" : "bg-yellow-50"
      );
    } else {
      await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
    }

    const freshCheckbox = page.getByRole("checkbox", { name: "fresh-response", exact: true });
    const freshDownload = page.getByRole("row", { name: /fresh-response/ }).getByRole("button");
    if (blocked) {
      await expect.element(freshCheckbox).toBeDisabled();
      await expect.element(freshDownload).toBeDisabled();
    } else {
      await expect.element(freshCheckbox).toBeEnabled();
      await expect.element(freshDownload).toBeEnabled();
    }
    await expect
      .element(page.getByRole("checkbox", { name: "old-response", exact: true }))
      .toBeEnabled();
    await expect
      .element(page.getByRole("row", { name: /old-response/ }).getByRole("button"))
      .toBeEnabled();

    await userEvent.click(page.getByRole("checkbox").first());
    await expect
      .element(page.getByTestId("selected-response-ids"))
      .toHaveTextContent(blocked ? "old-response" : "old-response,fresh-response");
    if (blocked) {
      await expect.element(freshCheckbox).not.toBeChecked();
    }
  });

  it.each([undefined, false, true])(
    "handles overdue downloaded responses from another tab with nagware=%s",
    async (nagwareEnabled) => {
      const { rerender } = await render(
        <DownloadTable
          {...defaultProps}
          nagwareEnabled={nagwareEnabled}
          statusFilter={StatusFilter.NEW}
          oldestDownloadedCreatedAt={Date.now() - 36 * 86400000}
          vaultSubmissions={[makeResponse("fresh-response", VaultStatus.NEW, 1)]}
        />
      );
      const checkbox = page.getByRole("checkbox", { name: "fresh-response", exact: true });
      const download = page.getByRole("row", { name: /fresh-response/ }).getByRole("button");
      if (nagwareEnabled) {
        await expect
          .element(page.getByRole("alert"))
          .toHaveTextContent(
            "Downloading is restricted until responses are signed off for removal"
          );
        await expect.element(checkbox).toBeDisabled();
        await expect.element(download).toBeDisabled();
      } else {
        await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
        await expect.element(checkbox).toBeEnabled();
        await expect.element(download).toBeEnabled();
      }
      await expect.element(page.getByTestId("numberOfSubmissions")).not.toBeInTheDocument();
      await userEvent.click(page.getByRole("checkbox").first());
      expect(page.getByTestId("selected-response-ids").element().textContent).toBe(
        nagwareEnabled ? "" : "fresh-response"
      );

      await rerender(
        <DownloadTable
          {...defaultProps}
          nagwareEnabled={nagwareEnabled}
          statusFilter={StatusFilter.NEW}
          oldestDownloadedCreatedAt={null}
          vaultSubmissions={[makeResponse("fresh-response", VaultStatus.NEW, 1)]}
        />
      );
      await expect.element(checkbox).toBeEnabled();
      await expect.element(download).toBeEnabled();
      await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
    }
  );

  it("uses configured thresholds in the banner and download controls", async () => {
    await render(
      <DownloadTable
        {...defaultProps}
        nagwarePromptAfter={7}
        nagwareWarnAfter={10}
        statusFilter={StatusFilter.NEW}
        vaultSubmissions={[
          makeResponse("old-response", VaultStatus.NEW, 11),
          makeResponse("fresh-response", VaultStatus.NEW, 1),
        ]}
      />
    );
    expect(page.getByRole("alert").element().textContent).toContain("over 10 days old");
    await expect
      .element(page.getByRole("checkbox", { name: "fresh-response", exact: true }))
      .toBeDisabled();
  });
});

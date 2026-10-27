/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { DownloadTable } from "../DownloadTable";
import { VaultSubmissionOverview, VaultStatus } from "@lib/types";
import axios from "axios";
import { StatusFilter } from "../../types";
import { DownloadDialog } from "../Dialogs/DownloadDialog/DownloadDialog";
import type { DownloadWarnings } from "../Dialogs/DownloadDialog/DownloadDialog.types";

vi.mock("../Dialogs/DownloadDialog/DownloadDialog", () => ({
  DownloadDialog: vi.fn(() => null),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "keys") {
        return "start";
      }
      return undefined;
    },
  }),
  usePathname: vi.fn(),
  useParams: vi.fn(() => ({
    statusFilter: [],
  })),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("../../actions", () => ({
  __esModule: true,
  getSubmissionsByFormat: vi.fn(),
}));

const RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB = 500;

describe("Download Table", () => {
  afterEach(cleanup);

  it("Download Table should render", async () => {
    const promise = Promise.resolve();
    const axiosSpy = vi.spyOn(axios, "get");

    axiosSpy.mockImplementation((url: string) => {
      if (url === "/api/settings/nagwarePhaseEncouraged") {
        return Promise.resolve({ data: 21 });
      } else if (url === "/api/settings/nagwarePhaseWarned") {
        return Promise.resolve({ data: 35 });
      } else {
        return Promise.reject(new Error("Invalid URL"));
      }
    });

    const rendered = render(
      <DownloadTable
        statusFilter={StatusFilter.NEW}
        vaultSubmissions={vaultSubmissions}
        formId="clg17xha50008efkgfgxa8l4f"
        formName={""}
        nagwareResult={null}
        responseDownloadLimit={0}
        responsesDownloadZipMaxSizeMB={RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB}
        overdueAfter={0}
        startFromExclusiveResponse={null}
      />
    );
    const table = rendered.getByRole("table");
    expect(table).toHaveAttribute("aria-live", "polite");

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });
  });

  it.each(["1", "3"])("shows the version column for responses all from version %s", (version) => {
    const singleVersionSubmissions = vaultSubmissions.map((submission) => ({
      ...submission,
      version,
    }));

    const rendered = render(
      <DownloadTable
        statusFilter={StatusFilter.NEW}
        vaultSubmissions={singleVersionSubmissions}
        formId="clg17xha50008efkgfgxa8l4f"
        formName=""
        nagwareResult={null}
        responseDownloadLimit={100}
        responsesDownloadZipMaxSizeMB={RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB}
        overdueAfter={0}
        startFromExclusiveResponse={null}
      />
    );

    expect(rendered.getByRole("columnheader", { name: /Version/ })).toBeInTheDocument();
    expect(rendered.container.querySelectorAll(`td[data-version="${version}"]`)).toHaveLength(
      singleVersionSubmissions.length
    );
  });

  it.each<DownloadWarnings>([
    { sizeLimitReached: true, processingFailed: false },
    { sizeLimitReached: false, processingFailed: true },
    { sizeLimitReached: true, processingFailed: true },
    { sizeLimitReached: false, processingFailed: false },
  ])("shows the appropriate warnings for %j", async (warnings) => {
    const rendered = render(
      <DownloadTable
        statusFilter={StatusFilter.NEW}
        vaultSubmissions={vaultSubmissions}
        formId="clg17xha50008efkgfgxa8l4f"
        formName=""
        nagwareResult={null}
        responseDownloadLimit={100}
        responsesDownloadZipMaxSizeMB={125}
        overdueAfter={0}
        startFromExclusiveResponse={null}
      />
    );

    await act(async () => {
      vi.mocked(DownloadDialog).mock.lastCall![0].onSuccessfulDownload([], warnings);
    });

    expect(rendered.queryByText("Download smaller batches") !== null).toBe(
      warnings.sizeLimitReached
    );
    expect(rendered.queryByText("Could not download all responses or attachments") !== null).toBe(
      warnings.processingFailed
    );
    if (warnings.sizeLimitReached) {
      expect(rendered.getByText("This download exceeds our maximum 125 MB.")).toBeInTheDocument();
      if (!warnings.processingFailed) {
        expect(
          rendered.getByText("Download smaller batches").closest('[data-testid="alert"]')
        ).toHaveFocus();
      }
    }
    if (warnings.processingFailed) {
      expect(rendered.getByText("Try downloading remaining responses again.")).toBeInTheDocument();
      if (!warnings.sizeLimitReached) {
        expect(
          rendered
            .getByText("Could not download all responses or attachments")
            .closest('[data-testid="alert"]')
        ).toHaveFocus();
      }
    }

    await act(async () => {
      vi.mocked(DownloadDialog).mock.lastCall![0].onSuccessfulDownload([]);
    });
    expect(rendered.queryByText("Download smaller batches")).not.toBeInTheDocument();
    expect(
      rendered.queryByText("Could not download all responses or attachments")
    ).not.toBeInTheDocument();
  });

  it("clears the greyed-out state when a row is selected again", async () => {
    const rendered = render(
      <DownloadTable
        statusFilter={StatusFilter.NEW}
        vaultSubmissions={vaultSubmissions}
        formId="clg17xha50008efkgfgxa8l4f"
        formName=""
        nagwareResult={null}
        responseDownloadLimit={100}
        responsesDownloadZipMaxSizeMB={RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB}
        overdueAfter={0}
        startFromExclusiveResponse={null}
      />
    );
    const responseId = vaultSubmissions[0].name;

    await act(async () => {
      vi.mocked(DownloadDialog).mock.lastCall![0].onSuccessfulDownload([responseId]);
    });

    const checkbox = rendered.getByRole("checkbox", { name: responseId });
    expect(checkbox.closest("tr")).toHaveClass("opacity-50");

    fireEvent.click(checkbox);

    expect(checkbox.closest("tr")).not.toHaveClass("opacity-50");
  });
});

// Test Data taken from a local vault response on 2023-04-06
const vaultSubmissions: VaultSubmissionOverview[] = [
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "03-04-0022",
    createdAt: 1680549853671,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    name: "03-04-0c36",
    createdAt: 1680549843373,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.DOWNLOADED,
    name: "03-04-0caa",
    createdAt: 1680549836782,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.DOWNLOADED,
    name: "03-04-0d87",
    createdAt: 1680549838736,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    name: "03-04-18df",
    createdAt: 1680549858548,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    name: "03-04-2ccc",
    createdAt: 1680549825466,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    name: "03-04-2ce6",
    createdAt: 1680549852237,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    name: "03-04-3232",
    createdAt: 1680549829065,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    name: "03-04-394c",
    createdAt: 1680549827470,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    name: "03-04-40bb",
    createdAt: 1680549846213,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.PROBLEM,
    name: "03-04-54de",
    createdAt: 1680549841683,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.PROBLEM,
    name: "03-04-6ca5",
    createdAt: 1680549856861,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "03-04-8a87",
    createdAt: 1680549855408,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "03-04-914b",
    createdAt: 1680549849354,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "03-04-a4c5",
    createdAt: 1680549844830,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "03-04-affc",
    createdAt: 1680549847443,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "03-04-bff8",
    createdAt: 1680549819049,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "03-04-d9b1",
    createdAt: 1680549823799,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    name: "03-04-e721",
    createdAt: 1680549850908,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "03-04-fe4e",
    createdAt: 1680549834891,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "06-04-4aab",
    createdAt: 1680794669621,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "06-04-7f15",
    createdAt: 1680794662371,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    name: "06-04-c718",
    createdAt: 1680794671753,
  },
];

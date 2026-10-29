/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { DownloadTable } from "../DownloadTable";
import { Nagware } from "@formBuilder/components/Nagware";
import { NextStep } from "../NextStep";
import { initialTableItemsState } from "../DownloadTableReducer";
import { NagLevel, VaultSubmissionOverview, VaultStatus } from "@lib/types";
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

  it.each([
    { age: 14, overdue: false },
    { age: 15, overdue: false },
    { age: 16, overdue: true },
  ])("preserves the existing table overdue threshold: %j", ({ age, overdue }) => {
    for (const status of [VaultStatus.NEW, VaultStatus.DOWNLOADED]) {
      const submission = { ...vaultSubmissions[0], status, createdAt: Date.now() - age * 86400000 };
      const rendered = render(
        <NextStep
          statusFilter={status === VaultStatus.NEW ? StatusFilter.NEW : StatusFilter.DOWNLOADED}
          submission={submission}
          overdueAfter={15}
          removedRows={[]}
        />
      );
      expect(rendered.queryByText("Overdue") !== null).toBe(overdue);
      expect(initialTableItemsState([submission], 15).numberOfOverdueResponses).toBe(
        overdue ? 1 : 0
      );
      rendered.unmount();
    }
  });

  it.each([
    { source: "loaded", enabled: undefined },
    { source: "loaded", enabled: false },
    { source: "loaded", enabled: true },
    { source: "downloaded", enabled: undefined },
    { source: "downloaded", enabled: false },
    { source: "downloaded", enabled: true },
  ])("gates nagware with the off-by-default setting: %j", ({ source, enabled }) => {
    const fresh = { ...vaultSubmissions[0], name: "fresh", createdAt: Date.now() - 86400000 };
    const old = { ...vaultSubmissions[0], name: "old", createdAt: Date.now() - 36 * 86400000 };
    const rendered = render(
      <DownloadTable
        statusFilter={StatusFilter.NEW}
        vaultSubmissions={source === "loaded" ? [old, fresh] : [fresh]}
        oldestDownloadedCreatedAt={source === "downloaded" ? old.createdAt : null}
        formId={fresh.formID}
        formName=""
        responseDownloadLimit={100}
        responsesDownloadZipMaxSizeMB={RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB}
        overdueAfter={15}
        nagwarePromptAfter={21}
        nagwareWarnAfter={35}
        nagwareEnabled={enabled}
        startFromExclusiveResponse={null}
      />
    );
    expect(rendered.getByRole("checkbox", { name: fresh.name })).toHaveProperty(
      "disabled",
      Boolean(enabled)
    );
    expect(rendered.container.querySelector("#button-fresh")).toHaveProperty(
      "disabled",
      Boolean(enabled)
    );
    expect(rendered.queryByText(/Downloading is restricted/) !== null).toBe(Boolean(enabled));
    if (!enabled) {
      expect(rendered.queryByTestId("numberOfSubmissions")).not.toBeInTheDocument();
    }
    fireEvent.click(rendered.getAllByRole("checkbox")[0]);
    expect(vi.mocked(DownloadDialog).mock.lastCall![0].checkedItems.has(fresh.name)).toBe(!enabled);
  });

  it.each([
    {
      level: NagLevel.UnsavedSubmissionsOver21DaysOld,
      count: 20,
      days: 7,
      instructions: "removal of all overdue new responses",
    },
    {
      level: NagLevel.UnsavedSubmissionsOver21DaysOld,
      count: 21,
      days: 7,
      instructions: "removal of 20 overdue new responses at a time",
    },
    {
      level: NagLevel.UnsavedSubmissionsOver35DaysOld,
      count: 20,
      days: 10,
      instructions: "sign off on all overdue responses before continuing",
    },
    {
      level: NagLevel.UnsavedSubmissionsOver35DaysOld,
      count: 21,
      days: 10,
      instructions: "sign off on 20 overdue responses at a time before continuing",
    },
  ])(
    "preserves banner instructions at the count boundary: %j",
    ({ level, count, days, instructions }) => {
      const rendered = render(
        <Nagware
          nagwareResult={{ level, numberOfSubmissions: count }}
          nagwarePromptAfter={7}
          nagwareWarnAfter={10}
        />
      );
      const body = rendered.getByTestId("numberOfSubmissions").closest("p");
      expect(body).toHaveTextContent(String(count));
      expect(body).toHaveTextContent(`${days} days`);
      expect(body).toHaveTextContent(instructions);
    }
  );

  it.each([StatusFilter.NEW, StatusFilter.DOWNLOADED])(
    "renders valid overdue paragraph markup on the %s tab",
    (statusFilter) => {
      const rendered = render(
        <NextStep
          statusFilter={statusFilter}
          submission={{ ...vaultSubmissions[0], createdAt: Date.now() - 36 * 86400000 }}
          overdueAfter={15}
          removedRows={[]}
        />
      );

      const label = rendered.getByText("Overdue");
      expect(label.closest("p")).toBeInTheDocument();
      expect(label.parentElement?.tagName).toBe("SPAN");
      expect(rendered.container.querySelector("p div")).toBeNull();
    }
  );

  it.each([
    { age: null, warnAfter: 35, blocked: false },
    { age: 35, warnAfter: 35, blocked: false },
    { age: 36, warnAfter: 35, blocked: true },
    { age: 36, warnAfter: 40, blocked: false },
    { age: 11, warnAfter: 10, blocked: true },
  ])("checks overdue downloaded responses from another tab: %j", ({ age, warnAfter, blocked }) => {
    const submission = { ...vaultSubmissions[0], createdAt: Date.now() - 86400000 };
    const props = {
      statusFilter: StatusFilter.NEW,
      vaultSubmissions: [submission],
      oldestDownloadedCreatedAt: age === null ? null : Date.now() - age * 86400000,
      formId: submission.formID,
      formName: "",
      responseDownloadLimit: 100,
      responsesDownloadZipMaxSizeMB: RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB,
      overdueAfter: 15,
      nagwarePromptAfter: 7,
      nagwareWarnAfter: warnAfter,
      nagwareEnabled: true,
      startFromExclusiveResponse: null,
    };
    const rendered = render(<DownloadTable {...props} />);

    expect(rendered.getByRole("checkbox", { name: submission.name })).toHaveProperty(
      "disabled",
      blocked
    );
    expect(rendered.container.querySelector(`#button-${submission.name}`)).toHaveProperty(
      "disabled",
      blocked
    );
    expect(
      rendered.queryByText(
        "Downloading is restricted until responses are signed off for removal"
      ) !== null
    ).toBe(blocked);
    expect(rendered.queryByTestId("numberOfSubmissions")).not.toBeInTheDocument();
    fireEvent.click(rendered.getAllByRole("checkbox")[0]);
    expect(vi.mocked(DownloadDialog).mock.lastCall![0].checkedItems.size).toBe(blocked ? 0 : 1);

    rendered.rerender(<DownloadTable {...props} oldestDownloadedCreatedAt={null} />);
    expect(rendered.getByRole("checkbox", { name: submission.name })).toBeEnabled();

    rendered.rerender(
      <DownloadTable
        {...props}
        statusFilter={StatusFilter.DOWNLOADED}
        vaultSubmissions={[{ ...submission, status: VaultStatus.DOWNLOADED }]}
      />
    );
    expect(rendered.container.querySelector(`#button-${submission.name}`)).toBeEnabled();
  });

  it.each([
    { age: 36, status: VaultStatus.NEW, blocked: true, warnAfter: 35 },
    { age: 36, status: VaultStatus.DOWNLOADED, blocked: true, warnAfter: 35 },
    { age: 21, status: VaultStatus.NEW, blocked: false, warnAfter: 35 },
    { age: 35, status: VaultStatus.NEW, blocked: false, warnAfter: 35 },
    { age: 35, status: VaultStatus.DOWNLOADED, blocked: false, warnAfter: 35 },
    { age: 1, status: VaultStatus.NEW, blocked: false, warnAfter: 35 },
    { age: 36, status: VaultStatus.CONFIRMED, blocked: false, warnAfter: 35 },
    { age: 36, status: VaultStatus.NEW, blocked: false, warnAfter: 40 },
    { age: 11, status: VaultStatus.DOWNLOADED, blocked: true, warnAfter: 10 },
  ])(
    "restricts fresh downloads after the configured threshold: %j",
    ({ age, status, blocked, warnAfter }) => {
      const submissions = [
        {
          ...vaultSubmissions[0],
          name: "existing-response",
          status,
          createdAt: Date.now() - age * 86400000,
        },
        {
          ...vaultSubmissions[0],
          name: "fresh-response",
          createdAt: Date.now(),
        },
        {
          ...vaultSubmissions[0],
          name: "boundary-response",
          createdAt: Date.now() - warnAfter * 86400000,
        },
      ];
      const rendered = render(
        <DownloadTable
          statusFilter={StatusFilter.NEW}
          vaultSubmissions={submissions}
          formId={vaultSubmissions[0].formID}
          formName=""
          responseDownloadLimit={100}
          responsesDownloadZipMaxSizeMB={RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB}
          overdueAfter={20}
          nagwarePromptAfter={7}
          nagwareWarnAfter={warnAfter}
          nagwareEnabled={true}
          startFromExclusiveResponse={null}
        />
      );

      for (const name of ["fresh-response", "boundary-response"]) {
        const checkbox = rendered.getByRole("checkbox", { name });
        const button = rendered.container.querySelector(`#button-${name}`);
        expect(checkbox).toHaveProperty("disabled", blocked);
        expect(button).toHaveProperty("disabled", blocked);
      }
      expect(
        rendered.queryByText(
          status === VaultStatus.DOWNLOADED
            ? "Downloading is restricted until responses are signed off for removal"
            : "Downloading is restricted to overdue responses until they are retrieved"
        ) !== null
      ).toBe(blocked);
      if (blocked) {
        expect(rendered.getByTestId("numberOfSubmissions")).toHaveTextContent("1");
        expect(rendered.getByTestId("numberOfSubmissions").closest("p")).toHaveTextContent(
          `${warnAfter} days`
        );
      }
      expect(rendered.getByRole("checkbox", { name: "existing-response" })).toBeEnabled();
      expect(rendered.container.querySelector("#button-existing-response")).toBeEnabled();

      fireEvent.click(rendered.getAllByRole("checkbox")[0]);

      const selectedIds = [...vi.mocked(DownloadDialog).mock.lastCall![0].checkedItems.keys()];
      expect(selectedIds).toEqual(
        blocked ? ["existing-response"] : submissions.map((submission) => submission.name)
      );
    }
  );

  it.each([
    { age: 21, status: VaultStatus.NEW, title: null, promptAfter: 21 },
    { age: 22, status: VaultStatus.NEW, title: "Retrieve responses", promptAfter: 21 },
    {
      age: 22,
      status: VaultStatus.DOWNLOADED,
      title: "Sign off on the removal of responses from GC Forms",
      promptAfter: 21,
    },
    { age: 35, status: VaultStatus.NEW, title: "Retrieve responses", promptAfter: 21 },
    { age: 36, status: VaultStatus.CONFIRMED, title: null, promptAfter: 21 },
    { age: 8, status: VaultStatus.NEW, title: "Retrieve responses", promptAfter: 7 },
    { age: 22, status: VaultStatus.NEW, title: null, promptAfter: 25 },
  ])("derives nagware from the loaded responses: %j", ({ age, status, title, promptAfter }) => {
    const props = {
      statusFilter: StatusFilter.NEW,
      vaultSubmissions: [
        { ...vaultSubmissions[0], status, createdAt: Date.now() - age * 86400000 },
      ],
      formId: vaultSubmissions[0].formID,
      formName: "",
      responseDownloadLimit: 100,
      responsesDownloadZipMaxSizeMB: RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB,
      overdueAfter: 20,
      nagwarePromptAfter: promptAfter,
      nagwareWarnAfter: 35,
      nagwareEnabled: true,
      startFromExclusiveResponse: null,
    };
    const rendered = render(<DownloadTable {...props} />);

    if (title) {
      expect(rendered.getByText(title)).toBeInTheDocument();
      expect(rendered.getByTestId("numberOfSubmissions")).toHaveTextContent("1");
      expect(rendered.getByTestId("numberOfSubmissions").closest("p")).toHaveTextContent(
        `older than ${promptAfter} days`
      );
      expect(
        rendered.getByText(
          "Downloading will be restricted if overdue responses are older than 35 days."
        )
      ).toBeInTheDocument();
    } else {
      expect(rendered.queryByTestId("numberOfSubmissions")).not.toBeInTheDocument();
    }

    rendered.rerender(<DownloadTable {...props} vaultSubmissions={[]} />);
    expect(rendered.queryByTestId("numberOfSubmissions")).not.toBeInTheDocument();
  });

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
        responseDownloadLimit={0}
        responsesDownloadZipMaxSizeMB={RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB}
        overdueAfter={0}
        nagwarePromptAfter={21}
        nagwareWarnAfter={35}
        nagwareEnabled={true}
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
        responseDownloadLimit={100}
        responsesDownloadZipMaxSizeMB={RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB}
        overdueAfter={0}
        nagwarePromptAfter={21}
        nagwareWarnAfter={35}
        nagwareEnabled={true}
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
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    const rendered = render(
      <DownloadTable
        statusFilter={StatusFilter.NEW}
        vaultSubmissions={vaultSubmissions}
        formId="clg17xha50008efkgfgxa8l4f"
        formName=""
        responseDownloadLimit={100}
        responsesDownloadZipMaxSizeMB={125}
        overdueAfter={0}
        nagwarePromptAfter={21}
        nagwareWarnAfter={35}
        nagwareEnabled={true}
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
    expect(scrollIntoView).toHaveBeenCalledTimes(
      warnings.sizeLimitReached || warnings.processingFailed ? 1 : 0
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

    if (warnings.sizeLimitReached || warnings.processingFailed) {
      fireEvent.click(rendered.getAllByRole("checkbox")[0]);
      fireEvent.click(rendered.container.querySelector("#downloadTableButtonId")!);
    } else {
      await act(async () => {
        vi.mocked(DownloadDialog).mock.lastCall![0].onSuccessfulDownload([]);
      });
    }
    expect(rendered.queryByText("Download smaller batches")).not.toBeInTheDocument();
    expect(
      rendered.queryByText("Could not download all responses or attachments")
    ).not.toBeInTheDocument();
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it("clears the greyed-out state when a row is selected again", async () => {
    const rendered = render(
      <DownloadTable
        statusFilter={StatusFilter.NEW}
        vaultSubmissions={vaultSubmissions}
        formId="clg17xha50008efkgfgxa8l4f"
        formName=""
        responseDownloadLimit={100}
        responsesDownloadZipMaxSizeMB={RESPONSES_DOWNLOAD_ZIP_MAX_SIZE_MB}
        overdueAfter={0}
        nagwarePromptAfter={21}
        nagwareWarnAfter={35}
        nagwareEnabled={true}
        startFromExclusiveResponse={null}
      />
    );
    const responseId = vaultSubmissions[0].name;

    await act(async () => {
      vi.mocked(DownloadDialog).mock.lastCall![0].onSuccessfulDownload([responseId]);
    });

    const checkbox = rendered.getByRole("checkbox", { name: responseId });
    expect(
      rendered.getByTestId("numberOfSubmissions").closest('[data-testid="alert"]')
    ).toHaveClass("mb-4");
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

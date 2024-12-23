/**
 * @jest-environment jsdom
 */
import React from "react";
import { act, render } from "@testing-library/react";
import { DownloadTable } from "../DownloadTable";
import { VaultSubmissionOverview, VaultStatus } from "@lib/types";
import axios from "axios";
import { StatusFilter } from "../../types";

jest.mock("next/navigation", () => ({
  useSearchParams: () => jest.fn(),
  usePathname: () => jest.fn(),
  useParams: () => jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock("../../actions", () => ({
  __esModule: true,
  getSubmissionsByFormat: jest.fn(),
}));

describe("Download Table", () => {
  it("Download Table should render", async () => {
    const promise = Promise.resolve();
    const axiosSpy = jest.spyOn(axios, "get");

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

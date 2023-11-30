import React from "react";
import { render, act } from "@testing-library/react";
import { DownloadTable } from "../DownloadTable";
import { VaultSubmissionList, VaultStatus } from "@lib/types";
import { sortVaultSubmission } from "../DownloadTableReducer";
import axios from "axios";

jest.mock("next/router", () => require("next-router-mock"));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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
      <DownloadTable vaultSubmissions={vaultSubmissions} formId="clg17xha50008efkgfgxa8l4f" />
    );
    const table = rendered.getByRole("table");
    expect(table).toHaveAttribute("aria-live", "polite");

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });
  });

  // For expected sorting behavior see:
  // https://app.zenhub.com/workspaces/gcforms-60cb8929764d71000e481cab/issues/gh/cds-snc/platform-forms-client/1865
  it("Function sortVaultSubmission() sorts correctly", () => {
    const sortedVaultSubmissions = sortVaultSubmission(vaultSubmissions);
    expect(sortedVaultSubmissions.length === vaultSubmissions.length);

    // Status = New sorted "sub list", test order of first three
    expect(sortedVaultSubmissions[0].name).toEqual("06-04-c718");
    expect(sortedVaultSubmissions[0].status).toEqual(VaultStatus.NEW.valueOf()); // Just being explicit with these, can also manually check by looking at the data
    expect(sortedVaultSubmissions[1].name).toEqual("06-04-4aab");
    expect(sortedVaultSubmissions[1].status).toEqual(VaultStatus.NEW.valueOf());
    expect(sortedVaultSubmissions[2].name).toEqual("06-04-7f15");
    expect(sortedVaultSubmissions[2].status).toEqual(VaultStatus.NEW.valueOf());

    // Status !== New sorted "sub list", test order of first three
    expect(sortedVaultSubmissions[11].name).toEqual("03-04-18df");
    expect(sortedVaultSubmissions[11].status).not.toEqual(VaultStatus.NEW.valueOf());
    expect(sortedVaultSubmissions[12].name).toEqual("03-04-6ca5");
    expect(sortedVaultSubmissions[12].status).not.toEqual(VaultStatus.NEW.valueOf());
    expect(sortedVaultSubmissions[13].name).toEqual("03-04-2ce6");
    expect(sortedVaultSubmissions[13].status).not.toEqual(VaultStatus.NEW.valueOf());
  });
});

// Test Data taken from a local vault response on 2023-04-06
const vaultSubmissions: VaultSubmissionList[] = [
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-0022",
    createdAt: 1680549853671,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    securityAttribute: "Unclassified",
    name: "03-04-0c36",
    createdAt: 1680549843373,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: 1680551168405,
    downloadedAt: 1680550035137,
    removedAt: 1683143168405,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.DOWNLOADED,
    securityAttribute: "Unclassified",
    name: "03-04-0caa",
    createdAt: 1680549836782,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: undefined,
    downloadedAt: 1680551178000,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.DOWNLOADED,
    securityAttribute: "Unclassified",
    name: "03-04-0d87",
    createdAt: 1680549838736,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: undefined,
    downloadedAt: 1680551178035,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    securityAttribute: "Unclassified",
    name: "03-04-18df",
    createdAt: 1680549858548,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: 1680625853785,
    downloadedAt: 1680625838662,
    removedAt: 1683217853785,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    securityAttribute: "Unclassified",
    name: "03-04-2ccc",
    createdAt: 1680549825466,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: 1680630735668,
    downloadedAt: 1680630689700,
    removedAt: 1683222735668,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    securityAttribute: "Unclassified",
    name: "03-04-2ce6",
    createdAt: 1680549852237,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: 1680630735668,
    downloadedAt: 1680630689705,
    removedAt: 1683222735668,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    securityAttribute: "Unclassified",
    name: "03-04-3232",
    createdAt: 1680549829065,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: 1680703319388,
    downloadedAt: 1680703213201,
    removedAt: 1683295319388,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    securityAttribute: "Unclassified",
    name: "03-04-394c",
    createdAt: 1680549827470,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: 1680703319388,
    downloadedAt: 1680703213174,
    removedAt: 1683295319388,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    securityAttribute: "Unclassified",
    name: "03-04-40bb",
    createdAt: 1680549846213,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: 1680705070151,
    downloadedAt: 1680705027286,
    removedAt: 1683297070151,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.PROBLEM,
    securityAttribute: "Unclassified",
    name: "03-04-54de",
    createdAt: 1680549841683,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.PROBLEM,
    securityAttribute: "Unclassified",
    name: "03-04-6ca5",
    createdAt: 1680549856861,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-8a87",
    createdAt: 1680549855408,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-914b",
    createdAt: 1680549849354,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-a4c5",
    createdAt: 1680549844830,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-affc",
    createdAt: 1680549847443,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-bff8",
    createdAt: 1680549819049,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-d9b1",
    createdAt: 1680549823799,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.CONFIRMED,
    securityAttribute: "Unclassified",
    name: "03-04-e721",
    createdAt: 1680549850908,
    lastDownloadedBy: "peter.thiessen@cds-snc.ca",
    confirmedAt: 1680728670633,
    downloadedAt: 1680728208780,
    removedAt: 1683320670633,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-fe4e",
    createdAt: 1680549834891,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "06-04-4aab",
    createdAt: 1680794669621,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "06-04-7f15",
    createdAt: 1680794662371,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "06-04-c718",
    createdAt: 1680794671753,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
];

import React from "react";
import { DownloadTable } from "../../responses/DownloadTable";
import { Nagware } from "../../Nagware";
import Router from "next/router";
import { NagLevel, VaultStatus, VaultSubmissionList } from "../../../../../lib/types";

const today = new Date("July 16, 2023").valueOf();

const subDays = (date: number, days: number) => {
  const dt = new Date(date);
  const dt2 = new Date();
  dt2.setDate(dt.getDate() - days);
  return dt2;
};

describe("<Nagware />", () => {
  it("renders UnsavedOver35Days", () => {
    cy.mount(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnsavedSubmissionsOver35DaysOld,
          numberOfSubmissions: 5,
        }}
      />
    );

    cy.get("[role=alert]").should("have.attr", "class").and("contain", "bg-red-50");
    cy.get("[data-testid=numberOfSubmissions]").should("contain", "5");
  });

  it("renders UnconfirmedOver35Days", () => {
    cy.mount(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnconfirmedSubmissionsOver35DaysOld,
          numberOfSubmissions: 3,
        }}
      />
    );

    cy.get("[role=alert]").should("have.attr", "class").and("contain", "bg-red-50");
    cy.get("[data-testid=numberOfSubmissions]").should("contain", "3");
  });

  it("renders UnsavedOver21Days", () => {
    cy.mount(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnsavedSubmissionsOver21DaysOld,
          numberOfSubmissions: 1,
        }}
      />
    );

    cy.get("[role=alert]").should("have.attr", "class").and("contain", "bg-yellow-50");
    cy.get("[data-testid=numberOfSubmissions]").should("contain", "1");
  });

  it("renders UnconfirmedOver21Days", () => {
    cy.mount(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnconfirmedSubmissionsOver21DaysOld,
          numberOfSubmissions: 2,
        }}
      />
    );

    cy.get("[role=alert]").should("have.attr", "class").and("contain", "bg-yellow-50");
    cy.get("[data-testid=numberOfSubmissions]").should("contain", "2");
  });
});

describe("<DownloadTable />", () => {
  let router;

  beforeEach(() => {
    cy.clock(new Date("2023-7-16").getTime(), ["Date"]);

    router = {
      back: cy.stub().as("routerBack"),
    };

    cy.stub(Router, "useRouter").returns(router);
    cy.intercept("GET", "/api/settings/nagwarePhaseWarned", { setting: "35" });
    cy.intercept("GET", "/api/settings/nagwarePhaseEncouraged", { setting: "21" });
  });

  it("Blocks download of newer items when one is overdue by 35 days (account restricted)", () => {
    const vaultSubmissions: VaultSubmissionList[] = [
      {
        formID: "clg17xha50008efkgfgxa8l4f",
        status: VaultStatus.NEW,
        securityAttribute: "Unclassified",
        name: "Minus 20 days",
        createdAt: subDays(today, 20).valueOf(), // (-20 days)
        lastDownloadedBy: "",
        confirmedAt: undefined,
        downloadedAt: undefined,
        removedAt: undefined,
      },
      {
        formID: "clg17xha50008efkgfgxa8l4f",
        status: VaultStatus.NEW,
        securityAttribute: "Unclassified",
        name: "Minus 23 days",
        createdAt: subDays(today, 23).valueOf(), // (-23 days)
        lastDownloadedBy: "",
        confirmedAt: undefined,
        downloadedAt: undefined,
        removedAt: undefined,
      },
      {
        formID: "clg17xha50008efkgfgxa8l4f",
        status: VaultStatus.NEW,
        securityAttribute: "Unclassified",
        name: "Minus 36 days",
        createdAt: subDays(today, 36).valueOf(), // (-36 days)
        lastDownloadedBy: "",
        confirmedAt: undefined,
        downloadedAt: undefined,
        removedAt: undefined,
      },
      {
        formID: "clg17xha50008efkgfgxa8l4f",
        status: VaultStatus.NEW,
        securityAttribute: "Unclassified",
        name: "Minus 36 days",
        createdAt: subDays(today, 36).valueOf(), // (-36 days)
        lastDownloadedBy: "",
        confirmedAt: undefined,
        downloadedAt: undefined,
        removedAt: undefined,
      },
      {
        formID: "clg17xha50008efkgfgxa8l4f",
        status: VaultStatus.NEW,
        securityAttribute: "Unclassified",
        name: "Today",
        createdAt: today, // (today)
        lastDownloadedBy: "",
        confirmedAt: undefined,
        downloadedAt: undefined,
        removedAt: undefined,
      },
    ];

    const nagwareResult = {
      level: NagLevel.UnsavedSubmissionsOver35DaysOld,
      numberOfSubmissions: 1,
    };

    cy.viewport(1050, 550);
    cy.mount(<DownloadTable vaultSubmissions={vaultSubmissions} nagwareResult={nagwareResult} />);

    // The -35 overdue causes the rest to be blocked
    cy.get("tbody tr:nth-child(1)").should("have.attr", "class").and("contain", "opacity-50");
    cy.get("tbody tr:nth-child(2)").should("have.attr", "class").and("contain", "opacity-50");
    cy.get("tbody tr:nth-child(3)").should("have.attr", "class").and("not.contain", "opacity-50");
    cy.get("tbody tr:nth-child(4)").should("have.attr", "class").and("not.contain", "opacity-50");
    cy.get("tbody tr:nth-child(5)").should("have.attr", "class").and("not.contain", "opacity-50");

    cy.get("tbody tr:nth-child(5) td:nth-child(4)").should(
      "contain",
      "downloadResponsesTable.status.overdue"
    );

    cy.get("tbody tr:nth-child(4) td:nth-child(4)").should(
      "contain",
      "downloadResponsesTable.status.overdue"
    );

    // The -23 days should additionally have a warning
    cy.get("tbody tr:nth-child(3) td:nth-child(4)").should(
      "contain",
      "downloadResponsesTable.status.overdue"
    );
  });

  it("Warns for overdue submissions (not restricted)", () => {
    const vaultSubmissions: VaultSubmissionList[] = [
      {
        formID: "clg17xha50008efkgfgxa8l4f",
        status: VaultStatus.NEW,
        securityAttribute: "Unclassified",
        name: "Minus 20 days",
        createdAt: subDays(today, 20).valueOf(), // (-20 days)
        lastDownloadedBy: "",
        confirmedAt: undefined,
        downloadedAt: undefined,
        removedAt: undefined,
      },
      {
        formID: "clg17xha50008efkgfgxa8l4f",
        status: VaultStatus.NEW,
        securityAttribute: "Unclassified",
        name: "Minus 23 days",
        createdAt: subDays(today, 23).valueOf(), // (-23 days)
        lastDownloadedBy: "",
        confirmedAt: undefined,
        downloadedAt: undefined,
        removedAt: undefined,
      },
      {
        formID: "clg17xha50008efkgfgxa8l4f",
        status: VaultStatus.NEW,
        securityAttribute: "Unclassified",
        name: "Minus 36 days",
        createdAt: subDays(today, 30).valueOf(), // (-30 days)
        lastDownloadedBy: "",
        confirmedAt: undefined,
        downloadedAt: undefined,
        removedAt: undefined,
      },
      {
        formID: "clg17xha50008efkgfgxa8l4f",
        status: VaultStatus.NEW,
        securityAttribute: "Unclassified",
        name: "Today",
        createdAt: today, // (today)
        lastDownloadedBy: "",
        confirmedAt: undefined,
        downloadedAt: undefined,
        removedAt: undefined,
      },
    ];

    const nagwareResult = {
      level: NagLevel.UnsavedSubmissionsOver21DaysOld,
      numberOfSubmissions: 1,
    };

    cy.viewport(1050, 550);
    cy.mount(<DownloadTable vaultSubmissions={vaultSubmissions} nagwareResult={nagwareResult} />);

    cy.get("tbody tr:nth-child(1)").should("have.attr", "class").and("not.contain", "opacity-50");
    cy.get("tbody tr:nth-child(2)").should("have.attr", "class").and("not.contain", "opacity-50");
    cy.get("tbody tr:nth-child(3)").should("have.attr", "class").and("not.contain", "opacity-50");
    cy.get("tbody tr:nth-child(4)").should("have.attr", "class").and("not.contain", "opacity-50");

    cy.get("tbody tr:nth-child(4) td:nth-child(4)").should(
      "contain",
      "downloadResponsesTable.status.overdue"
    );

    // The -23 days should additionally have a warning
    cy.get("tbody tr:nth-child(3) td:nth-child(4)").should(
      "contain",
      "downloadResponsesTable.status.overdue"
    );
  });
});

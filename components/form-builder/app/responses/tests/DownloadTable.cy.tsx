import React from "react";
import { DownloadTable } from "@components/form-builder/app/responses/DownloadTable";
import { Nagware } from "@components/form-builder/app/Nagware";
import Router from "next/router";
import { NagLevel, VaultStatus, VaultSubmissionList } from "@lib/types";

const vaultSubmissions: VaultSubmissionList[] = [
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-0022",
    createdAt: 1686584665000,
    lastDownloadedBy: "",
    confirmedAt: undefined,
    downloadedAt: undefined,
    removedAt: undefined,
  },
  {
    formID: "clg17xha50008efkgfgxa8l4f",
    status: VaultStatus.NEW,
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
    status: VaultStatus.NEW,
    securityAttribute: "Unclassified",
    name: "03-04-8a87",
    createdAt: 1689695065000,
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

describe("<Nagware />", () => {
  it("renders UnsavedOver35Days", () => {
    cy.mount(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnsavedSubmissionsOver35DaysOld,
          numberOfSubmissions: 1,
        }}
      />
    );

    cy.get("[role=alert]").should("have.attr", "class").and("contain", "bg-[#f3e9e8]");
  });

  it("renders UnconfirmedOver35Days", () => {
    cy.mount(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnconfirmedSubmissionsOver35DaysOld,
          numberOfSubmissions: 1,
        }}
      />
    );

    cy.get("[role=alert]").should("have.attr", "class").and("contain", "bg-[#f3e9e8]");
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

    cy.get("[role=alert]").should("have.attr", "class").and("contain", "bg-amber-100");
  });

  it("renders UnconfirmedOver21Days", () => {
    cy.mount(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnconfirmedSubmissionsOver21DaysOld,
          numberOfSubmissions: 1,
        }}
      />
    );

    cy.get("[role=alert]").should("have.attr", "class").and("contain", "bg-amber-100");
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
    cy.intercept("GET", "/api/settings/nagwarePhaseEncouraged", { setting: "15" });
  });

  it("opens the add element dialog", () => {
    cy.viewport(1050, 600);
    cy.mount(<DownloadTable vaultSubmissions={vaultSubmissions} nagwareResult={nagwareResult} />);

    cy.get("tbody tr:nth-child(1)").should("have.attr", "class").and("contain", "opacity-50");
    cy.get("tbody tr:nth-child(2)").should("have.attr", "class").and("contain", "opacity-50");
    cy.get("tbody tr:nth-child(3)").should("have.attr", "class").and("not.contain", "opacity-50");
  });
});

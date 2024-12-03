/**
 * The tests in this file are currently skipped due to compatibility issues with NextJS Server Actions.
 * Cypress errors out when a mounted component or its children import a Server Action.
 * In this case, DownloadTable imports DownloadDialog which imports a Server Action.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import { DownloadTable } from "../DownloadTable";

import Router from "next/router";
import { NagLevel, VaultStatus, VaultSubmissionList } from "@lib/types";

const today = new Date("July 16, 2023").valueOf();

const subDays = (date: number, days: number) => {
  const dt = new Date(date);
  const dt2 = new Date();
  dt2.setDate(dt.getDate() - days);
  return dt2;
};

describe("<DownloadTable />", () => {
  let router;

  beforeEach(() => {
    cy.clock(new Date("2023-7-16").getTime(), ["Date"]);

    router = {
      back: cy.stub().as("routerBack"),
      query: {},
    };

    cy.stub(Router, "useRouter").returns(router);
    cy.intercept("GET", "/api/settings/nagwarePhaseWarned", { setting: "35" });
    cy.intercept("GET", "/api/settings/nagwarePhaseEncouraged", { setting: "21" });
  });

  it.skip("Blocks download of newer items when one is overdue by 35 days (account restricted)", () => {
    const vaultSubmissions: VaultSubmissionList[] = [
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
    ];

    const nagwareResult = {
      level: NagLevel.UnsavedSubmissionsOver35DaysOld,
      numberOfSubmissions: 1,
    };

    cy.viewport(1050, 550);
    // cy.mount(
    //   <DownloadTable
    //     formId=""
    //     responseDownloadLimit={50}
    //     vaultSubmissions={vaultSubmissions}
    //     nagwareResult={nagwareResult}
    //   />
    // );

    // The -35 overdue causes the rest to be blocked
    cy.get("tbody tr:nth-child(2)").should("have.attr", "class").and("contain", "opacity-50");
    cy.get("tbody tr:nth-child(3)").should("have.attr", "class").and("contain", "opacity-50");
    cy.get("tbody tr:nth-child(4)").should("have.attr", "class").and("not.contain", "opacity-50");
    cy.get("tbody tr:nth-child(5)").should("have.attr", "class").and("not.contain", "opacity-50");
    cy.get("tbody tr:nth-child(6)").should("have.attr", "class").and("not.contain", "opacity-50");

    cy.get("tbody tr:nth-child(6) td:nth-child(4)").should(
      "contain",
      "downloadResponsesTable.status.overdue"
    );

    cy.get("tbody tr:nth-child(5) td:nth-child(4)").should(
      "contain",
      "downloadResponsesTable.status.overdue"
    );

    // The -23 days should additionally have a warning
    cy.get("tbody tr:nth-child(4) td:nth-child(4)").should(
      "contain",
      "downloadResponsesTable.status.overdue"
    );
  });

  it.skip("Warns for overdue submissions (not restricted)", () => {
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
    // cy.mount(
    //   <DownloadTable
    //     formId=""
    //     responseDownloadLimit={50}
    //     vaultSubmissions={vaultSubmissions}
    //     nagwareResult={nagwareResult}
    //   />
    // );

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

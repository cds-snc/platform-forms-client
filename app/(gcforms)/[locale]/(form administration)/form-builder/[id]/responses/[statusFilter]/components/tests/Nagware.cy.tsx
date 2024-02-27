"use client";
import React from "react";
import { Nagware } from "@clientComponents/form-builder/app/Nagware";
import { NagLevel } from "@lib/types";

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

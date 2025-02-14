"use client";
import React from "react";
import { DownloadProgressHtml } from "./DownloadProgressHtml";

describe("<DownloadProgressHtml />", () => {
  describe("DownloadProgressHtml", () => {
    it("Renders a DownloadProgressHtml", () => {
      cy.mount(
        <DownloadProgressHtml
          type="progress"
          formResponse=""
          reviewItems={[]}
          language={"en"}
          host={"http://localhost:3000"}
          formId={"123"}
          formTitle="test"
          startSectionTitle="start"
        />
      );
      cy.get("[data-testid='alert']").should("be.visible");
      cy.get("[data-testid='alert']").should("have.class", "bg-emerald-50");
      cy.get("[data-testid='alert-icon']").should("have.class", "[&_svg]:fill-emerald-700");
      cy.get("[data-testid='alert-heading']").should("have.class", "text-emerald-700");
    });
  });
});

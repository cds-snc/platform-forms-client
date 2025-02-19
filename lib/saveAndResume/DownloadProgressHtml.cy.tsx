"use client";
import React from "react";
import { DownloadProgressHtml } from "./DownloadProgressHtml";

import { formResponse, reviewItems } from "./fixtures/data";

describe("<DownloadProgressHtml />", () => {
  describe("DownloadProgressHtml", () => {
    it("Renders a DownloadProgressHtml", () => {
      cy.mount(
        <DownloadProgressHtml
          type="progress"
          formResponse={formResponse}
          reviewItems={reviewItems}
          language={"en"}
          host={"http://localhost:3000"}
          formId={"123"}
          formTitle="test"
          startSectionTitle="start"
        />
      );

      cy.get("[data-testid='in-progress-badge']").should("be.visible");

      cy.get("[data-testid='review-list']")
        .should("be.visible")
        .within(() => {
          cy.contains("First name").should("be.visible");
          cy.contains("Last name").should("be.visible");
          cy.contains("Department or agency").should("be.visible");

          // Check values
          cy.contains("Dave").should("be.visible");
          cy.contains("Cheng").should("be.visible");
          cy.contains("Canada Border Services Agency").should("be.visible");
        });
    });
  });
});

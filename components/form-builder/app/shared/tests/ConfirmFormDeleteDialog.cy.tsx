import React from "react";
import { ConfirmFormDeleteDialog } from "../ConfirmFormDeleteDialog";
import { TemplateStoreProvider } from "@components/form-builder/store";

describe("<ConfirmFormDeleteDialog />", () => {
  it("shows unprocessed screen", () => {
    cy.viewport(800, 600);

    const handleConfirmSpy = cy.spy().as("handleConfirmSpy");
    const handleCloseSpy = cy.spy().as("handleCloseSpy");

    cy.intercept("GET", "/api/id/123/submission/unprocessed", {
      statusCode: 405,
      body: {
        error: "Found unprocessed submissions",
      },
    });

    cy.mount(
      <TemplateStoreProvider>
        <ConfirmFormDeleteDialog
          formId="123"
          handleConfirm={handleConfirmSpy}
          handleClose={handleCloseSpy}
          isPublished={false}
        />
      </TemplateStoreProvider>
    );

    cy.get("h2").contains("formDeleteResponses.title");
  });

  it("shows delete confirm screen", () => {
    cy.viewport(800, 600);

    const handleConfirmSpy = cy.spy().as("handleConfirmSpy");
    const handleCloseSpy = cy.spy().as("handleCloseSpy");

    cy.intercept("GET", "/api/id/456/submission/unprocessed", {
      statusCode: 200,
      body: {
        data: [],
      },
    });

    cy.mount(
      <TemplateStoreProvider>
        <ConfirmFormDeleteDialog
          formId="456"
          handleConfirm={handleConfirmSpy}
          handleClose={handleCloseSpy}
          isPublished={false}
        />
      </TemplateStoreProvider>
    );

    cy.get("h2").contains("formDelete.title");
  });

  it("confirms delete and closes", () => {
    cy.viewport(800, 600);

    const handleConfirmSpy = cy.spy().as("handleConfirmSpy");
    const handleCloseSpy = cy.spy().as("handleCloseSpy");

    cy.intercept("GET", "/api/id/456/submission/unprocessed", {
      statusCode: 200,
      body: {
        data: [],
      },
    });

    cy.mount(
      <TemplateStoreProvider>
        <ConfirmFormDeleteDialog
          formId="456"
          handleConfirm={handleConfirmSpy}
          handleClose={handleCloseSpy}
          isPublished={false}
        />
      </TemplateStoreProvider>
    );

    cy.get("h2").contains("formDelete.title");
    cy.get('[data-testid="confirm-delete"]').click();
    cy.get("@handleConfirmSpy").should("have.been.calledOnce");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("shows error screen", () => {
    cy.viewport(800, 600);

    const handleConfirmSpy = cy.spy().as("handleConfirmSpy");
    const handleCloseSpy = cy.spy().as("handleCloseSpy");

    cy.intercept("GET", "/api/id/789/submission/unprocessed", {
      statusCode: 500,
      body: {
        error: "Internal Server Error",
      },
    });

    cy.mount(
      <TemplateStoreProvider>
        <ConfirmFormDeleteDialog
          formId="789"
          handleConfirm={handleConfirmSpy}
          handleClose={handleCloseSpy}
          isPublished={false}
        />
      </TemplateStoreProvider>
    );

    cy.get("p").contains("Request failed with status code 500");
  });
});

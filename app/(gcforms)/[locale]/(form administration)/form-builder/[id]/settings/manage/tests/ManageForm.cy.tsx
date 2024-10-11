import React from "react";
import { ManageForm } from "../ManageForm";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";

describe("<ManageForm />", () => {
  it("can mount the component", () => {
    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <ManageForm
          closedDetails={null}
          nonce={""}
          canManageOwnership={false}
          canSetClosingDate={false}
          id={""}
        />
      </TemplateStoreProvider>
    );
  });

  it("displays an error if canManageOwnership is true and formRecord, usersAssignedToFormRecord, and allUsers are not provided", () => {
    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <ManageForm
          closedDetails={null}
          nonce={""}
          canManageOwnership={true}
          canSetClosingDate={false}
          id={""}
        />
      </TemplateStoreProvider>
    );
    cy.contains("There has been an error.");
  });

  it("displays the FormOwnership, and DownloadForm components", () => {
    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <ManageForm
          closedDetails={null}
          nonce={""}
          canManageOwnership={false}
          canSetClosingDate={true}
          formRecord={{}}
          usersAssignedToFormRecord={[]}
          allUsers={[]}
          id={""}
        />
      </TemplateStoreProvider>
    );
    cy.contains("Manage ownership");
    cy.contains("Download form");
  });

  it("displays the DownloadForm component if canManageOwnership is false", () => {
    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <ManageForm
          closedDetails={null}
          nonce={""}
          canManageOwnership={false}
          canSetClosingDate={false}
          id={""}
        />
      </TemplateStoreProvider>
    );
    cy.contains("Download form");
  });

  it("displays the FormOwnership component if canManageOwnership is true", () => {
    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <ManageForm
          closedDetails={null}
          nonce={""}
          canManageOwnership={true}
          canSetClosingDate={false}
          id={""}
          formRecord={{}}
          usersAssignedToFormRecord={[]}
          allUsers={[]}
        />
      </TemplateStoreProvider>
    );
    cy.contains("Manage ownership");
  });

  it("does not display the FormOwnership component if canManageOwnership is false", () => {
    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <ManageForm
          closedDetails={null}
          nonce={""}
          canManageOwnership={false}
          canSetClosingDate={false}
          id={""}
        />
      </TemplateStoreProvider>
    );
    cy.contains("Manage ownership").should("not.exist");
  });
});

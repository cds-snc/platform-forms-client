import React from "react";
import { DownloadForm } from "../../components/DownloadForm";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";

describe("<DownloadForm />", () => {
  it("can mount the component", () => {
    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <DownloadForm />
      </TemplateStoreProvider>
    );
  });
});

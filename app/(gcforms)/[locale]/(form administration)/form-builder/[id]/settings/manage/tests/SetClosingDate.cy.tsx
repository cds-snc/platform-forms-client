import React from "react";
import { SetClosingDate } from "../SetClosingDate";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";

describe("<DownloadForm />", () => {
  it("can mount the component", () => {
    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <SetClosingDate formID={""} />
      </TemplateStoreProvider>
    );
  });
});

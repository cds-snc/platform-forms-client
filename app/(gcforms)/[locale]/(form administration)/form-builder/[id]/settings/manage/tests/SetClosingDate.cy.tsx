import React from "react";
import { SetClosingDate } from "../close/SetClosingDate";
import { TemplateStoreProvider } from "@lib/store/useTemplateStore";

describe("<DownloadForm />", () => {
  it("can mount the component", () => {
    cy.mount(
      <TemplateStoreProvider form="" isPublished={false}>
        <SetClosingDate formId={"123"} closedDetails={null} />
      </TemplateStoreProvider>
    );
  });
});

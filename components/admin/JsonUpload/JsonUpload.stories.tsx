import React from "react";
import { FormElementTypes } from "@lib/types";
import { JSONUpload } from "./JsonUpload";

export default {
  title: "Admin/JsonUpload",
  component: JSONUpload,
};

export const defaultJSONUpload = (): React.ReactElement => <JSONUpload></JSONUpload>;

const testForm = {
  formID: 1,
  formConfig: {
    publishingStatus: true,
    securityAttribute: "Unclassified",
    submission: {
      email: "test@test.com",
    },
    form: {
      version: "1",
      titleEn: "Test JSON!",
      titleFr: "Test JSON!",
      layout: ["1"],
      elements: [
        {
          id: 1,
          type: FormElementTypes.textField,
          properties: {
            titleEn: "test Element!",
            titleFr: "test Element!",
          },
        },
      ],
    },
  },
};

export const populatedJSONUpload = (): React.ReactElement => <JSONUpload form={testForm} />;

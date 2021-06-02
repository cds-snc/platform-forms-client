import React from "react";
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
    submission: {
      email: "test@test.com",
    },
    form: {
      titleEn: "Test JSON!",
      titleFr: "Test JSON!",
      layout: ["1"],
      elements: [
        {
          id: "1",
          type: "button",
          properties: {
            titleEn: "test Element!",
            titleFr: "test Element!",
          },
        },
      ],
    },
  },
};

export const populatedJSONUpload = (): React.ReactElement => (
  <JSONUpload form={testForm}></JSONUpload>
);

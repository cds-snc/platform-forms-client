import React from "react";
import { FormElementTypes, FormRecord } from "@lib/types";
import { JSONUpload } from "./JsonUpload";

export default {
  title: "Admin/JsonUpload",
  component: JSONUpload,
};

export const defaultJSONUpload = (): React.ReactElement => <JSONUpload></JSONUpload>;

const testForm: FormRecord = {
  id: "test0form00000id000asdf11",
  name: "Test JSON!",
  form: {
    titleEn: "Test JSON!",
    titleFr: "Test JSON!",
    layout: [1],
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
  isPublished: true,
  deliveryOption: {
    emailAddress: "test@test.com",
    emailSubjectEn: "",
    emailSubjectFr: "",
  },
  securityAttribute: "Unclassified",
};

export const populatedJSONUpload = (): React.ReactElement => <JSONUpload form={testForm} />;

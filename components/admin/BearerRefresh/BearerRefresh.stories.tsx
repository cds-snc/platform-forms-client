import { Story } from "@storybook/react";
import React from "react";
import BearerRefresh, { BearerRefreshProps } from "./BearerRefresh";

export default {
  title: "Admin/BearerRefresh",
  component: BearerRefresh,
  decorators: [
    (Story: React.ComponentClass<unknown>): unknown => {
      return <Story />;
    },
  ],
};

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
          id: 1,
          type: "button",
          properties: {
            titleEn: "test Element!",
            titleFr: "test Element!",
          },
        },
      ],
    },
  },
  bearerToken:
    "abCdeFgiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb3JtSUQiOiIyIiwiaWF0IjoxNjQyMTk5NDIzLCJleHAiOjE2NzM3NTcwMjN9.bWRUJX0I_17_XTDFimQeUfLgwJKaBoNjAVxEGTWj6zg",
};

const Template: Story<BearerRefreshProps> = (args: BearerRefreshProps) => (
  <BearerRefresh {...args} />
);

export const defaultBearerRefresh = Template.bind({});
defaultBearerRefresh.args = {
  form: testForm,
};

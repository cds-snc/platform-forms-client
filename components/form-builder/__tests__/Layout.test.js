import React from "react";
import { cleanup, render } from "@testing-library/react";
import { Layout } from "../layout/Layout";
import { SessionProvider } from "next-auth/react";
import { TemplateStoreProvider } from "../store/useTemplateStore";
import { NavigationStoreProvider } from "../store/useNavigationStore";
import { FormElementTypes } from "@lib/types";

const store = {
  form: {
    version: 1,
    layout: [],
    introduction: {
      descriptionEn: "introduction text en",
      descriptionFr: "introduction text fr",
    },
    titleEn: "form title",
    titleFr: "form title fr",
    elements: [
      {
        id: 1,
        type: FormElementTypes.radio,
        properties: {
          titleEn: "question 1",
          titleFr: "question 2",
          choices: [],
          validation: { required: false },
          descriptionEn: "description en",
          descriptionFr: "description fr",
        },
      },
    ],
    privacyPolicy: { descriptionEn: "privacy text en", descriptionFr: "privacy text fr" },
    endPage: { descriptionEn: "confirm text en", descriptionFr: "confirm text fr" },
  },
  submission: { email: "test@example.com" },
  isPublished: true,
};

describe("Form Builder", () => {
  afterEach(cleanup);
  it("renders without errors", async () => {
    const { getByText } = render(
      <SessionProvider session={null}>
        <TemplateStoreProvider form={store.form} submission={null} isPublished={null}>
          <NavigationStoreProvider>
            <Layout />
          </NavigationStoreProvider>
        </TemplateStoreProvider>
      </SessionProvider>
    );
    const button = getByText("startH2");
    expect(button).toBeTruthy();
  });
});

import React from "react";
import { FormElementTypes } from "@lib/types";
import { SessionProvider } from "next-auth/react";
import { TemplateStoreProvider } from "./store";
import { FormProperties } from "@lib/types";

export const store = {
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
          titleFr: "question 1 fr",
          choices: [],
          validation: { required: false },
          descriptionEn: "description 1 en",
          descriptionFr: "description 1 fr",
        },
      },
      {
        id: 2,
        type: "email",
        properties: {
          titleEn: "question 2",
          titleFr: "question 2 fr",
          choices: [],
          validation: { required: false },
          descriptionEn: "description 2 en",
          descriptionFr: "description 2 fr",
        },
      },
    ],
    privacyPolicy: { descriptionEn: "privacy text en", descriptionFr: "privacy text fr" },
    endPage: { descriptionEn: "confirm text en", descriptionFr: "confirm text fr" },
  },
  submission: { email: "test@example.com" },
  isPublished: true,
};

export const Wrapper = ({
  children,
  form,
}: {
  children: React.ReactNode;
  form: FormProperties;
}) => (
  <SessionProvider session={null}>
    <TemplateStoreProvider form={form} submission={undefined} isPublished={undefined}>
      {children}
    </TemplateStoreProvider>
  </SessionProvider>
);

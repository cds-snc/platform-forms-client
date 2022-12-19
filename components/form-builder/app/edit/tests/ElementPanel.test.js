import React from "react";
import { cleanup, render, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ElementPanel } from "../ElementPanel";
import { SessionProvider } from "next-auth/react";
import { TemplateStoreProvider } from "../../../store";
import { FormElementTypes } from "@lib/types";

const options = ["richText", "email", "date", "phone"];

// Mock your i18n
jest.mock("next-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        language: "en",
        changeLanguage: () => Promise.resolve(),
      },
    };
  },
}));

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

describe("Element Panel", () => {
  afterEach(cleanup);
  it("renders element radio element and updates when clicking element select", async () => {
    let rendered = null;
    await act(() => {
      rendered = render(
        <SessionProvider session={null}>
          <TemplateStoreProvider form={store.form} submission={null} isPublished={null}>
            <ElementPanel item={{ index: 0, ...store.form.elements[0] }} />
          </TemplateStoreProvider>
        </SessionProvider>
      );
    });

    await waitFor(async () => {
      const question = rendered.getByLabelText("question 1");
      expect(question.value).toBe("question 1");

      const description = rendered.container.querySelector("#item0-describedby").textContent;
      expect(description).toContain("description 1 en");

      const dropdown = rendered.getByTestId("element-select-active");

      await userEvent.click(dropdown);
      await userEvent.click(rendered.getByTestId(options[1]));
      expect(rendered.getByTestId("element-select-active").textContent).toContain(options[1]);
      expect(rendered.getByTestId(options[1])).toBeInTheDocument();

      const panelActions = rendered.getByLabelText("elementActions");
      expect(panelActions).toBeInTheDocument();
    });
  });

  it("renders element email element", async () => {
    let rendered = null;
    await act(() => {
      rendered = render(
        <SessionProvider session={null}>
          <TemplateStoreProvider form={store.form} submission={null} isPublished={null}>
            <ElementPanel item={{ index: 1, ...store.form.elements[1] }} />
          </TemplateStoreProvider>
        </SessionProvider>
      );
    });

    await waitFor(() => {
      const question = rendered.getByLabelText("question 2");
      expect(question.value).toBe("question 2");
      expect(rendered.getByTestId("element-select-active").textContent).toContain("email");
      expect(rendered.getByTestId("email")).toBeInTheDocument();
      expect(rendered.getByTestId("email").textContent).toContain("example@canada.gc.ca");
    });
  });
});

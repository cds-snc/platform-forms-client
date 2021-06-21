import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

const dynamicRowData = {
  id: 1,
  type: "dynamicRow",
  properties: {
    titleEn: "",
    titleFr: "",
    validation: {
      required: false,
    },
    subElements: [
      {
        id: 1,
        type: "textField",
        properties: {
          titleEn: "Amount Owing",
          titleFr: "Somme due",
          placeholderEn: "",
          placeholderFr: "",
          description: "",
          validation: {
            required: false,
          },
        },
      },
      {
        id: 2,
        type: "textField",
        properties: {
          titleEn: "Nature of the amount owing (e.g. taxes, penalties, overpayments)",
          titleFr: "Nature de la somme due (p. ex., impôts, pénalités, trop payés)",
          placeholderEn: "",
          placeholderFr: "",
          description: "",
          validation: {
            required: false,
          },
        },
      },
      {
        id: 3,
        type: "textField",
        properties: {
          titleEn: "Department or agency to which amount is owed",
          titleFr: "Ministère ou organisme auquel la somme en souffrance est due",
          placeholderEn: "",
          placeholderFr: "",
          description: "",
          validation: {
            required: false,
          },
        },
      },
    ],
  },
};

const formConfig = {
  id: 1,
  version: 1,
  titleEn: "Test Form",
  titleFr: "Formulaire de test",
  layout: [1],
  elements: [dynamicRowData],
};

describe.each([
  ["en", "Add Row", "Item"],
  ["fr", "Ajouter Element", "Article"],
])("Generate a dynamic row", (lang, buttonText, itemText) => {
  afterEach(cleanup);
  describe("renders without errors", () => {
    test("...initialState", () => {
      render(
        <Form formConfig={formConfig} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} />
        </Form>
      );

      const titleProp = lang === "en" ? "titleEn" : "titleFr";

      // Item has a title
      expect(screen.getByText(itemText + " 1")).toBeInTheDocument();
      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(1);
      // All children are present in row 1
      expect(screen.getByTestId("dynamic-row-1"))
        .toContainElement(
          screen.getByRole("textbox", {
            name: dynamicRowData.properties.subElements[0].properties[titleProp],
          })
        )
        .toContainElement(
          screen.getByRole("textbox", {
            name: dynamicRowData.properties.subElements[1].properties[titleProp],
          })
        )
        .toContainElement(
          screen.getByRole("textbox", {
            name: dynamicRowData.properties.subElements[2].properties[titleProp],
          })
        );
    });

    test("Add a row", () => {
      render(
        <Form formConfig={formConfig} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} />
        </Form>
      );
      const titleProp = lang === "en" ? "titleEn" : "titleFr";
      fireEvent.click(screen.getByRole("button", { name: buttonText }));
      expect(screen.getByText(itemText + " 1")).toBeInTheDocument();
      expect(screen.getByText(itemText + " 2")).toBeInTheDocument();
      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(2);
      // All children are present in row 1
      expect(screen.getByTestId("dynamic-row-1"))
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[0].properties[titleProp],
          })[0]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[1].properties[titleProp],
          })[0]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[2].properties[titleProp],
          })[0]
        );
      expect(screen.getByTestId("dynamic-row-2"))
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[0].properties[titleProp],
          })[1]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[1].properties[titleProp],
          })[1]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[2].properties[titleProp],
          })[1]
        );
    });
  });
});

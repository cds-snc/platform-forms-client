import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "../Form/Form";
import { GenerateElement } from "../../../lib/formBuilder";

const dynamicRowData = {
  id: 1,
  type: "dynamicRow",
  properties: {
    titleEn: "",
    titleFr: "",
    placeholderEn: "Amount Owning",
    placeholderFr: " Montant Due",
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

describe.each([["en"], ["fr"]])("Generate a dynamic row", (lang) => {
  afterEach(cleanup);
  describe("renders without errors", () => {
    test("...initialState", () => {
      render(
        <Form formConfig={formConfig} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} />
        </Form>
      );

      const titleProp = lang === "en" ? "titleEn" : "titleFr";

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
      // mocking scroll into view function (not implemented in jsdom)
      window.HTMLElement.prototype.scrollIntoView = jest.fn();

      const titleProp = lang === "en" ? "titleEn" : "titleFr";
      fireEvent.click(screen.getByTestId("add-row-button-1"));
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
    test("Delete a row", () => {
      render(
        <Form formConfig={formConfig} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} />
        </Form>
      );
      // mocking scroll into view function (not implemented in jsdom)
      window.HTMLElement.prototype.scrollIntoView = jest.fn();

      // Add a new row to ensure we have 2 rows
      fireEvent.click(screen.getByTestId("add-row-button-1"));

      const titleProp = lang === "en" ? "titleEn" : "titleFr";
      fireEvent.click(screen.getByTestId("delete-row-button-1.1"));
      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(1);
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
    });
    test("Data reorders properly after row deletion", () => {
      render(
        <Form formConfig={formConfig} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} />
        </Form>
      );
      // mocking scroll into view function (not implemented in jsdom)
      window.HTMLElement.prototype.scrollIntoView = jest.fn();

      // Add 2 new rows to ensure we have 3 rows
      fireEvent.click(screen.getByTestId("add-row-button-1"));
      fireEvent.click(screen.getByTestId("add-row-button-1"));

      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(3);

      // Fill Fields with Data.

      screen.queryAllByRole("textbox").forEach((field, index) => {
        userEvent.type(field, index.toString());
      });

      // Delete first Row
      fireEvent.click(screen.getByTestId("delete-row-button-1.0"));

      // check values
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(2);
      const fields = screen.queryAllByRole("textbox");
      expect(fields).toHaveLength(6);
      const fieldValues = fields.map((field) => field.value);
      // values 1,2,3 were deleted with row 1
      expect(fieldValues).toEqual(["3", "4", "5", "6", "7", "8"]);
    });
  });
});

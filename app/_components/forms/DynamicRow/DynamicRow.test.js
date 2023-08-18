import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "@components/forms";
import { GenerateElement } from "@lib/formBuilder";

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
    maxNumberOfRows: 3,
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

const formRecord = {
  id: "test0form00000id000asdf11",
  form: {
    id: 1,
    version: 1,
    titleEn: "Test Form",
    titleFr: "Formulaire de test",
    layout: [1],
    elements: [dynamicRowData],
  },
};

describe.each([["en"], ["fr"]])("Generate a dynamic row", (lang) => {
  afterEach(cleanup);
  describe("renders without errors", () => {
    test("...initialState", () => {
      render(
        <Form formRecord={formRecord} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} t={(key) => key} />
        </Form>
      );

      const titleProp = lang === "en" ? "titleEn" : "titleFr";

      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(1);
      // All children are present in row 1
      const dynamicRow = screen.getByTestId("dynamic-row-1");
      expect(dynamicRow).toContainElement(
        screen.getByRole("textbox", {
          name: dynamicRowData.properties.subElements[0].properties[titleProp],
        })
      );
      expect(dynamicRow).toContainElement(
        screen.getByRole("textbox", {
          name: dynamicRowData.properties.subElements[1].properties[titleProp],
        })
      );
      expect(dynamicRow).toContainElement(
        screen.getByRole("textbox", {
          name: dynamicRowData.properties.subElements[2].properties[titleProp],
        })
      );
    });
    test("Add a row", async () => {
      const user = userEvent.setup();
      render(
        <Form formRecord={formRecord} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} t={(key) => key} />
        </Form>
      );
      // mocking scroll into view function (not implemented in jsdom)
      window.HTMLElement.prototype.scrollIntoView = jest.fn();

      const titleProp = lang === "en" ? "titleEn" : "titleFr";
      await user.click(screen.getByTestId("add-row-button-1"));
      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(2);
      const dynamicRow = screen.getByTestId("dynamic-row-1");
      // All children are present in row 1
      expect(dynamicRow).toContainElement(
        screen.queryAllByRole("textbox", {
          name: dynamicRowData.properties.subElements[0].properties[titleProp],
        })[0]
      );
      expect(dynamicRow).toContainElement(
        screen.queryAllByRole("textbox", {
          name: dynamicRowData.properties.subElements[1].properties[titleProp],
        })[0]
      );
      expect(dynamicRow).toContainElement(
        screen.queryAllByRole("textbox", {
          name: dynamicRowData.properties.subElements[2].properties[titleProp],
        })[0]
      );
      const dynamicRow2 = screen.getByTestId("dynamic-row-2");
      expect(dynamicRow2).toContainElement(
        screen.queryAllByRole("textbox", {
          name: dynamicRowData.properties.subElements[0].properties[titleProp],
        })[1]
      );
      expect(dynamicRow2).toContainElement(
        screen.queryAllByRole("textbox", {
          name: dynamicRowData.properties.subElements[1].properties[titleProp],
        })[1]
      );
      expect(dynamicRow2).toContainElement(
        screen.queryAllByRole("textbox", {
          name: dynamicRowData.properties.subElements[2].properties[titleProp],
        })[1]
      );
    });
    test("Delete a row", async () => {
      const user = userEvent.setup();
      render(
        <Form formRecord={formRecord} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} t={(key) => key} />
        </Form>
      );
      // mocking scroll into view function (not implemented in jsdom)
      window.HTMLElement.prototype.scrollIntoView = jest.fn();

      // Add a new row to ensure we have 2 rows
      await user.click(screen.getByTestId("add-row-button-1"));

      const titleProp = lang === "en" ? "titleEn" : "titleFr";
      await user.click(screen.getByTestId("delete-row-button-1.1"));
      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(1);
      // All children are present in row 1
      const dynamicRow = screen.getByTestId("dynamic-row-1");
      expect(dynamicRow).toContainElement(
        screen.queryAllByRole("textbox", {
          name: dynamicRowData.properties.subElements[0].properties[titleProp],
        })[0]
      );
      expect(dynamicRow).toContainElement(
        screen.queryAllByRole("textbox", {
          name: dynamicRowData.properties.subElements[1].properties[titleProp],
        })[0]
      );
      expect(dynamicRow).toContainElement(
        screen.queryAllByRole("textbox", {
          name: dynamicRowData.properties.subElements[2].properties[titleProp],
        })[0]
      );
    });
    test("Data reorders properly after row deletion", async () => {
      const user = userEvent.setup();
      render(
        <Form formRecord={formRecord} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} t={(key) => key} />
        </Form>
      );
      // mocking scroll into view function (not implemented in jsdom)
      window.HTMLElement.prototype.scrollIntoView = jest.fn();

      // Add 2 new rows to ensure we have 3 rows
      await user.click(screen.getByTestId("add-row-button-1"));
      await user.click(screen.getByTestId("add-row-button-1"));

      expect(screen.getAllByTestId("dynamic-row", { exact: false })).toHaveLength(3);

      // Fill Fields with Data.

      let fields = screen.getAllByTestId("textInput");
      let index = 0;
      for (const field of fields) {
        // userEvent.type needs to be run sequentially
        // eslint-disable-next-line no-await-in-loop
        await user.type(field, index.toString());
        index++;
      }

      // Delete first Row
      await user.click(screen.getByTestId("delete-row-button-1.0"));

      // check values
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(2);
      fields = screen.getAllByTestId("textInput");
      expect(fields).toHaveLength(6);
      const fieldValues = fields.map((field) => field.value);
      // values [0, 1, 2] were deleted with row 1
      expect(fieldValues).toEqual(["3", "4", "5", "6", "7", "8"]);
    });

    test("Maximum number of rows", async () => {
      const user = userEvent.setup();
      render(
        <Form formRecord={formRecord} t={(key) => key} language={lang}>
          <GenerateElement element={dynamicRowData} language={lang} t={(key) => key} />
        </Form>
      );

      // mocking scroll into view function (not implemented in jsdom)
      window.HTMLElement.prototype.scrollIntoView = jest.fn();

      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(1);

      await user.click(screen.getByTestId("add-row-button-1"));

      expect(screen.queryAllByTestId("add-row-button-1")).toHaveLength(1);
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(2);

      await user.click(screen.getByTestId("add-row-button-1"));

      expect(screen.queryAllByTestId("add-row-button-1")).toHaveLength(0);
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(3);

      await user.click(screen.getByTestId("delete-row-button-1.0"));

      expect(screen.queryAllByTestId("add-row-button-1")).toHaveLength(1);
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(2);
    });
  });
});

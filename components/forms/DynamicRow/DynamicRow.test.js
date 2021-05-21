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

describe("Generate a dynamic row", () => {
  afterEach(cleanup);
  describe("... in English", () => {
    test("...initialState", () => {
      render(
        <Form formConfig={formConfig} t={(key) => key} language="en">
          <GenerateElement element={dynamicRowData} language="en" />
        </Form>
      );

      // Item has a title
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(1);
      // All children are present in row 1
      expect(screen.getByTestId("dynamic-row-1"))
        .toContainElement(
          screen.getByRole("textbox", {
            name: dynamicRowData.properties.subElements[0].properties.titleEn,
          })
        )
        .toContainElement(
          screen.getByRole("textbox", {
            name: dynamicRowData.properties.subElements[1].properties.titleEn,
          })
        )
        .toContainElement(
          screen.getByRole("textbox", {
            name: dynamicRowData.properties.subElements[2].properties.titleEn,
          })
        );
    });

    test("Add a row", () => {
      render(
        <Form formConfig={formConfig} t={(key) => key} language="en">
          <GenerateElement element={dynamicRowData} language="en" />
        </Form>
      );
      fireEvent.click(screen.getByRole("button", { name: "Add Row" }));
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(2);
      // All children are present in row 1
      expect(screen.getByTestId("dynamic-row-1"))
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[0].properties.titleEn,
          })[0]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[1].properties.titleEn,
          })[0]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[2].properties.titleEn,
          })[0]
        );
      expect(screen.getByTestId("dynamic-row-2"))
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[0].properties.titleEn,
          })[1]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[1].properties.titleEn,
          })[1]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[2].properties.titleEn,
          })[1]
        );
    });
  });
  describe("...in French", () => {
    test("...initialState", () => {
      render(
        <Form formConfig={formConfig} t={(key) => key} language="fr">
          <GenerateElement element={dynamicRowData} language="fr" />
        </Form>
      );

      // Item has a title
      expect(screen.getByText("Article 1")).toBeInTheDocument();
      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(1);
      // All children are present in row 1
      expect(screen.getByTestId("dynamic-row-1"))
        .toContainElement(
          screen.getByRole("textbox", {
            name: dynamicRowData.properties.subElements[0].properties.titleFr,
          })
        )
        .toContainElement(
          screen.getByRole("textbox", {
            name: dynamicRowData.properties.subElements[1].properties.titleFr,
          })
        )
        .toContainElement(
          screen.getByRole("textbox", {
            name: dynamicRowData.properties.subElements[2].properties.titleFr,
          })
        );
    });

    test("Add a row", () => {
      render(
        <Form formConfig={formConfig} t={(key) => key} language="fr">
          <GenerateElement element={dynamicRowData} language="fr" />
        </Form>
      );
      fireEvent.click(screen.getByRole("button", { name: "Ajouter Element" }));
      expect(screen.getByText("Article 1")).toBeInTheDocument();
      expect(screen.getByText("Article 2")).toBeInTheDocument();
      // There is only 1 row on initiation
      expect(screen.queryAllByTestId("dynamic-row", { exact: false })).toHaveLength(2);
      // All children are present in row 1
      expect(screen.getByTestId("dynamic-row-1"))
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[0].properties.titleFr,
          })[0]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[1].properties.titleFr,
          })[0]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[2].properties.titleFr,
          })[0]
        );
      expect(screen.getByTestId("dynamic-row-2"))
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[0].properties.titleFr,
          })[1]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[1].properties.titleFr,
          })[1]
        )
        .toContainElement(
          screen.queryAllByRole("textbox", {
            name: dynamicRowData.properties.subElements[2].properties.titleFr,
          })[1]
        );
    });
  });
});

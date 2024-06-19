import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Form } from "@clientComponents/forms/Form/Form";
import { getFormInitialValues, getRenderedForm } from "../formBuilder";
import TestForm from "../../__fixtures__/testData.json";
// GenerateElement from formbuilder is tested in all Component Tests

describe("getFormInitialValues() tests", () => {
  test("...can get Form initial values", () => {
    const expectedResponse = {
      1: "",
      2: "",
      4: "",
      5: "",
      6: [],
      7: [
        {
          0: "",
          1: "",
          2: "",
          3: [],
        },
      ],
      8: "",
      // currentGroup: "",
    };
    const initialValues = getFormInitialValues(
      {
        id: "",
        form: TestForm,
        isPublished: false,
        securityAttribute: "Unclassified",
      },
      "en"
    );
    expect(initialValues).toEqual(expectedResponse);
  });
});

describe("Get rendered form", () => {
  afterEach(cleanup);

  test.each([["en"], ["fr"]])("Renders form for all elements - English", (lang) => {
    const form = {
      id: "id1234",
      form: TestForm,
      isPublished: false,
      deliveryOption: {
        emailAddress: "",
        emailSubjectEn: "",
        emailSubjectFr: "",
      },
      securityAttribute: "Unclassified",
    };
    const t = jest.fn((key) => key);

    const response = getRenderedForm(form, lang, t);
    render(
      <Form formRecord={form} language={lang} router={jest.fn(() => {})} t={t}>
        {response}
      </Form>
    );
    // screen.debug();
    expect(screen.queryAllByRole("textbox").length).toBe(6);
    expect(screen.queryAllByRole("checkbox").length).toBe(6);
    expect(screen.queryAllByRole("radio").length).toBe(5);
    expect(screen.queryAllByRole("combobox").length).toBe(1);
    expect(screen.queryAllByRole("option").length).toBe(15);
    expect(screen.queryAllByRole("group").length).toBe(4);
    expect(screen.queryAllByRole("button").length).toBe(2);
  });
});

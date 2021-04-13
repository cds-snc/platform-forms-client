import { validateOnSubmit, getErrorList } from "../validation";
import { cleanup, render, screen } from "@testing-library/react";

function getFormMetaData(type, required = false) {
  return {
    formMetadata: {
      elements: [
        {
          id: 1,
          properties: {
            validation: {
              type: type,
              required: required,
            },
          },
        },
      ],
    },
    t: (key) => key,
  };
}
describe("Test input validation", () => {
  test("Validation on required field", () => {
    const props = getFormMetaData("", true);
    const values = { 1: "" };
    const errors = validateOnSubmit(values, props);
    expect(errors).toMatchObject({ 1: "input-validation.required" });
  });
  describe("Text validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("text");
      const values = { 1: "Joe % Pine" };
      const errors = validateOnSubmit(values, props);
      expect(errors).toMatchObject({ 1: "input-validation.text" });
    });
    test("validation to pass", () => {
      const props = getFormMetaData("text");
      const values = { 1: "Joe Pine" };
      const errors = validateOnSubmit(values, props);
      expect(errors).not.toMatchObject({ 1: "input-validation.text" });
    });
  });
  describe("Email validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("email");
      const values = { 1: "joe.pine.com" };
      const errors = validateOnSubmit(values, props);
      expect(errors).toMatchObject({ 1: "input-validation.email" });
    });
    test("validation to pass", () => {
      const props = getFormMetaData("email");
      const values = { 1: "joe.pine@cedar.com" };
      const errors = validateOnSubmit(values, props);
      expect(errors).not.toMatchObject({ 1: "input-validation.email" });
    });
  });
  describe("Number validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("number");
      const values = { 1: "pine" };
      const errors = validateOnSubmit(values, props);
      expect(errors).toMatchObject({ 1: "input-validation.number" });
    });

    test("validation to pass", () => {
      const props = getFormMetaData("number");
      const values = { 1: "4" };
      const errors = validateOnSubmit(values, props);
      expect(errors).not.toMatchObject({ 1: "input-validation.number" });
    });
  });
  describe("Date validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("date");
      const values = { 1: "25/05/1950" };
      const errors = validateOnSubmit(values, props);
      expect(errors).toMatchObject({ 1: "input-validation.date" });
    });

    test("validation to pass", () => {
      const props = getFormMetaData("date");
      const values = { 1: "06/05/1950" };
      const errors = validateOnSubmit(values, props);
      expect(errors).not.toMatchObject({ 1: "input-validation.date" });
    });
  });
  describe("Phone validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("phone");
      const values = { 1: "888-8989" };
      const errors = validateOnSubmit(values, props);
      expect(errors).toMatchObject({ 1: "input-validation.phone" });
    });

    test("validation to pass", () => {
      const props = getFormMetaData("phone");
      const values = { 1: "1-819-555-7777" };
      const errors = validateOnSubmit(values, props);
      expect(errors).not.toMatchObject({ 1: "input-validation.phone" });
    });
  });
  test("Value not in elements", () => {
    const props = getFormMetaData("", true);
    const values = { 4: "test value" };
    const errors = validateOnSubmit(values, props);
    expect(errors).not.toHaveProperty("4");
  });
});
describe("Test getErrorList function", () => {
  afterEach(cleanup);
  const props = {
    touched: true,
    errors: {
      1: "input-validation.text",
      2: "input-validation.phone",
    },
  };
  test("Does the error list render", () => {
    const errors = getErrorList(props);
    render(errors);
    screen.debug;
    expect(screen.getByText("input-validation.text"))
      .toBeInTheDocument()
      .toHaveClass("gc-error-link");
    expect(screen.getByText("input-validation.phone"))
      .toBeInTheDocument()
      .toHaveClass("gc-error-link");
    expect(screen.getByRole("list")).toHaveClass("gc-ordered-list");
  });
});

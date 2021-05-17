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

// Add array of what should pass and fail and then map
const text_ToPass = [{ 1: "Joe Pine" }, { 1: "Joe-Pine" }];
const text_ToFail = [{ 1: "Joe % Pine" }, { 1: "Joe&Pine" }];
const email_ToPass = [{ 1: "joe.pine@cedar.com" }];
const email_ToFail = [{ 1: "joe.pine.com" }];
const number_ToFail = [{ 1: "two" }, { 1: "four" }];
const number_ToPass = [{ 1: "1" }, { 1: "4" }];
const date_ToPass = [{ 1: "06/05/1950" }];
const date_ToFail = [{ 1: "25/05/1950" }];
const phone_ToPass = [{ 1: "1-819-555-7777" }];
const phone_ToFail = [{ 1: "888-8989" }];

describe("Test input validation", () => {
  test("Validation on required field", () => {
    const props = getFormMetaData("", true);
    const values = { 1: "" };
    const errors = validateOnSubmit(values, props);
    expect(errors).toMatchObject({ 1: "input-validation.required" });
  });
  describe("Alphanumeric validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("alphanumeric");
      text_ToFail.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).toMatchObject({
          1: "input-validation.alphanumeric",
        });
      });
    });
    test("validation to pass", () => {
      const props = getFormMetaData("text");
      text_ToPass.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).not.toMatchObject({
          1: "input-validation.text",
        });
      });
    });
  });
  describe("Email validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("email");
      email_ToFail.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).toMatchObject({ 1: "input-validation.email" });
      });
    });
    test("validation to pass", () => {
      const props = getFormMetaData("email");
      email_ToPass.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).not.toMatchObject({
          1: "input-validation.email",
        });
      });
    });
  });
  describe("Number validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("number");
      number_ToFail.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).toMatchObject({
          1: "input-validation.number",
        });
      });
    });

    test("validation to pass", () => {
      const props = getFormMetaData("number");
      number_ToPass.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).not.toMatchObject({
          1: "input-validation.number",
        });
      });
    });
  });
  describe("Date validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("date");
      date_ToFail.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).toMatchObject({ 1: "input-validation.date" });
      });
    });

    test("validation to pass", () => {
      const props = getFormMetaData("date");
      date_ToPass.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).not.toMatchObject({
          1: "input-validation.date",
        });
      });
    });
  });
  describe("Phone validation", () => {
    test("validation to fail", () => {
      const props = getFormMetaData("phone");
      phone_ToFail.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).toMatchObject({ 1: "input-validation.phone" });
      });
    });

    test("validation to pass", () => {
      const props = getFormMetaData("phone");
      phone_ToPass.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).not.toMatchObject({
          1: "input-validation.phone",
        });
      });
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
    expect(screen.getByText("input-validation.text"))
      .toBeInTheDocument()
      .toHaveClass("gc-error-link");
    expect(screen.getByText("input-validation.phone"))
      .toBeInTheDocument()
      .toHaveClass("gc-error-link");
    expect(screen.getByRole("list")).toHaveClass("gc-ordered-list");
  });
});

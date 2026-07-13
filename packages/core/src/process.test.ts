import { PublicFormRecord } from "@gcforms/types";
import contactFormRecord from "../__fixtures__/contactformRecord.json";

import { validate, validateVisibleElements } from "./process";

// https://forms-staging.cdssandbox.xyz/en/id/cmeaj61dl0001xf01aja6mnpf

describe("Form validation - start page", () => {
  it("should validate start page when empty", () => {
    const values = {};

    const currentGroup = "start";

    const errors = validate({
      values: values,
      currentGroup,
      formRecord: contactFormRecord as PublicFormRecord,
    });

    expect(errors).toStrictEqual({
      "11": "input-validation.required", // Preferred language
      "2": "input-validation.required", // Your name
    });
  });

  it("should validate start page some fields are filled in", () => {
    const values = { 11: "English" };
    const currentGroup = "start";

    const errors = validate({
      values: values,
      currentGroup,
      formRecord: contactFormRecord as PublicFormRecord,
    });

    expect(errors).toStrictEqual({
      "2": "input-validation.required", // Your name
    });
  });

  it("should show start group elements", () => {
    const values = {
      "2": "Tim",
      currentGroup: "start",
    };

    const { visibility } = validateVisibleElements(values, {
      formRecord: contactFormRecord as PublicFormRecord,
      t: (str) => str,
    });

    // For start page all fields are visible
    const result = new Map<string, boolean>();
    result.set("2", true); // Your name
    result.set("8", true); // How can we contact you
    result.set("9", true); // Phone #
    result.set("10", true); // Emnail
    result.set("11", true); // Preferred language

    expect(visibility).toStrictEqual(result);
  });
});

describe("Form validation - details page", () => {
  it("should show other text field when 'Other' is selected", () => {
    const values = {
      "2": "Tim",
      "9": "111-222-3333",
      "10": "Tim@example.com",
      "11": "English",
      "12": "Other",
      "13": "Other text field",
      currentGroup: "b0e74a96-fa9e-43f4-8573-4b4ba23d65e5",
    };

    const { visibility } = validateVisibleElements(values, {
      formRecord: contactFormRecord as PublicFormRecord,
      t: (str) => str,
    });

    // For details page 'Other'  is selected so the 'Other' text field is visible
    const result = new Map<string, boolean>();
    result.set("12", true);
    result.set("13", true);

    expect(visibility).toStrictEqual(result);
  });

  it("should hide other text field when 'API' is selected", () => {
    const values = {
      "2": "Tim",
      "9": "111-222-3333",
      "10": "Tim@example.com",
      "11": "English",
      "12": "Request technical support with the API",
      "13": "Other text field",
      "14": "More info",
      currentGroup: "b0e74a96-fa9e-43f4-8573-4b4ba23d65e5",
    };

    const { visibility } = validateVisibleElements(values, {
      formRecord: contactFormRecord as PublicFormRecord,
      t: (str) => str,
    });

    // For details page 'Other'  is selected so the 'Other' text field is visible
    const result = new Map<string, boolean>();
    result.set("12", true);

    expect(visibility).toStrictEqual(result);
  });

  it("should validate details page when empty", () => {
    const values = {};
    const currentGroup = "b0e74a96-fa9e-43f4-8573-4b4ba23d65e5";

    const errors = validate({
      values: values,
      currentGroup,
      formRecord: contactFormRecord as PublicFormRecord,
    });

    expect(errors).toStrictEqual({
      "12": "input-validation.required", // Reason for reaching out
    });
  });
});

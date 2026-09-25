/**
 * @vitest-environment jsdom
 */
import React from "react";
import { Form, Formik } from "formik";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TextArea } from "./TextArea/TextArea";
import { TextInput } from "./TextInput/TextInput";

describe("TextInput and TextArea error associations", () => {
  afterEach(() => cleanup());

  it("associates TextInput errors with the input", () => {
    render(
      <Formik
        initialValues={{ name: "" }}
        initialErrors={{ name: "Name is required" }}
        initialTouched={{ name: true }}
        onSubmit={() => {}}
      >
        <Form>
          <TextInput id="name" name="name" type="text" required />
        </Form>
      </Formik>
    );

    const input = screen.getByTestId("textInput");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "errorMessage-name");
    expect(screen.getByRole("alert")).toHaveAttribute("id", "errorMessage-name");
  });

  it("associates TextArea errors with the textarea", () => {
    render(
      <Formik
        initialValues={{ description: "" }}
        initialErrors={{ description: "Description is required" }}
        initialTouched={{ description: true }}
        onSubmit={() => {}}
      >
        <Form>
          <TextArea id="description" name="description" required />
        </Form>
      </Formik>
    );

    const textarea = screen.getByTestId("textarea");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-describedby", "errorMessage-description");
    expect(screen.getByRole("alert")).toHaveAttribute("id", "errorMessage-description");
  });
});
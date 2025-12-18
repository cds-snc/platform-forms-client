import { describe, it, expect, beforeAll } from "vitest";
import { page } from "@vitest/browser/context";
import { TextInput } from "@clientComponents/forms/TextInput/TextInput";
import { Formik } from "formik";
import { render } from "vitest-browser-react";
import { setupFonts } from "../helpers/setupFonts";

import "@root/styles/app.scss";
import "@root/i18n/client";

describe("<TextInput />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("mounts", async () => {
    await render(
      <Formik
        initialValues={{ textInput: "" }}
        onSubmit={() => {
          throw new Error("Function not implemented.");
        }}
      >
        <TextInput id="test" name="textInput" type="text" />
      </Formik>
    );

    const input = page.getByTestId("textInput");
    await expect.element(input).toBeVisible();
  });

  describe("Character Limits", () => {
    it("does not display any message when not enough characters have been typed in", async () => {
      await render(
        <Formik
          initialValues={{ textInput: "" }}
          onSubmit={() => {
            throw new Error("Function not implemented.");
          }}
        >
          <TextInput id="test" name="textInput" type="text" maxLength={40} />
        </Formik>
      );

      const input = page.getByTestId("textInput");
      await input.fill("This is 21 characters");

      const characterMessage = page.getByText(/characters left/i);
      await expect.element(characterMessage).not.toBeInTheDocument();
    });

    it("displays a message with the number of characters remaining", async () => {
      await render(
        <Formik
          initialValues={{ textInput: "" }}
          onSubmit={() => {
            throw new Error("Function not implemented.");
          }}
        >
          <TextInput id="test" name="textInput" type="text" maxLength={40} />
        </Formik>
      );

      const input = page.getByTestId("textInput");
      await input.fill("This is 35 characters This is 35 ch");

      // Character count should appear when remaining < 25% of maxLength (i.e., < 10 characters remaining)
      const characterMessage = page.getByText(/5.*characters left/i);
      await expect.element(characterMessage).toBeVisible();
    });

    it("displays an error message indicating too many characters", async () => {
      await render(
        <Formik
          initialValues={{ textInput: "" }}
          onSubmit={() => {
            throw new Error("Function not implemented.");
          }}
        >
          <TextInput id="test" name="textInput" type="text" maxLength={40} />
        </Formik>
      );

      const input = page.getByTestId("textInput");
      await input.fill("This is 48 characters This is 48 characters This");

      const characterMessage = page.getByText(/exceeded the limit/i);
      await expect.element(characterMessage).toBeVisible();
    });

    it("updates character count message dynamically as user types", async () => {
      await render(
        <Formik
          initialValues={{ textInput: "" }}
          onSubmit={() => {
            throw new Error("Function not implemented.");
          }}
        >
          <TextInput id="test" name="textInput" type="text" maxLength={40} />
        </Formik>
      );

      const input = page.getByTestId("textInput");

      // Type enough to trigger the message (35 chars = 5 remaining, which is < 25% of 40)
      await input.fill("This is 35 characters This is 35 ch");
      let characterMessage = page.getByText(/5.*characters left/i);
      await expect.element(characterMessage).toBeVisible();

      // Type a bit less (33 chars = 7 remaining, still < 10 which is 25% of 40)
      await input.fill("This is 33 characterss This is 33");
      characterMessage = page.getByText(/7.*characters left/i);
      await expect.element(characterMessage).toBeVisible();

      // Type more to exceed limit (48 chars = -8 over limit)
      await input.fill("This is 48 characters This is 48 characters This");
      const errorMessage = page.getByText(/exceeded the limit/i);
      await expect.element(errorMessage).toBeVisible();
    });
  });
});

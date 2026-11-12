/**
 * @vitest-environment jsdom
 */
import React from "react";
import { createInstance } from "i18next";
import { Formik, Form, useFormikContext, getIn } from "formik";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { TextInput } from "@clientComponents/forms/TextInput/TextInput";
import { TextArea } from "@clientComponents/forms/TextArea/TextArea";
import en from "../../../i18n/translations/en/common.json";

const i18n = createInstance();
vi.mock("@i18n/client", () => ({
  useTranslation: () => ({ t: i18n.t.bind(i18n) }),
}));
beforeAll(async () => {
  await i18n.init({ resources: { en: { common: en } }, lng: "en", defaultNS: "common" });
});
afterEach(cleanup);

const Summary = ({ name }: { name: string }) => {
  const { errors } = useFormikContext();
  return <div data-testid="summary">{getIn(errors, name)}</div>;
};

describe.each(["input", "textarea"] as const)("%s character errors", (kind) => {
  test.each(["answer", "rows.0.0"])(
    "deduplicates and clears the submitted error for %s",
    async (name) => {
      const message = (count: number) => i18n.t("formElements.characterCount.exceeded", { count });
      const { container } = render(
        <Formik
          initialValues={name === "answer" ? { answer: "" } : { rows: [{ 0: "" }] }}
          validateOnChange={false}
          validateOnBlur={false}
          validate={() =>
            name === "answer" ? { answer: message(1) } : { rows: [{ 0: message(1) }] }
          }
          onSubmit={vi.fn()}
        >
          <Form>
            <Summary name={name} />
            {kind === "input" ? (
              <TextInput id={name} name={name} type="text" maxLength={2} />
            ) : (
              <TextArea id={name} name={name} maxLength={2} />
            )}
            <button type="submit">Submit</button>
          </Form>
        </Formik>
      );
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "abc" } });
      expect(screen.getByText(message(1))).toBeInTheDocument();
      expect(screen.queryByTestId("errorMessage")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button"));
      await waitFor(() => expect(screen.getByTestId("errorMessage")).toHaveTextContent(message(1)));
      expect(container.querySelector(`[id="characterCountMessage${name}"]`)).toBeNull();
      expect(input.getAttribute("aria-describedby")).not.toContain("characterCountMessage");

      fireEvent.change(input, { target: { value: "abcd" } });
      await waitFor(() => expect(screen.getByTestId("errorMessage")).toHaveTextContent(message(2)));
      expect(screen.getByTestId("summary")).toHaveTextContent(message(2));
      expect(container.querySelector(`[id="characterCountMessage${name}"]`)).toBeNull();

      fireEvent.change(input, { target: { value: "ab" } });
      await waitFor(() => expect(screen.queryByTestId("errorMessage")).not.toBeInTheDocument());
      expect(screen.getByTestId("summary")).toBeEmptyDOMElement();
      expect(input).not.toHaveAttribute("aria-invalid");

      fireEvent.change(input, { target: { value: "abc" } });
      expect(screen.getByText(message(1))).toBeInTheDocument();
      expect(screen.queryByTestId("errorMessage")).not.toBeInTheDocument();
    }
  );

  test("keeps unrelated errors and counts prefilled values", () => {
    render(
      <Formik
        initialValues={{ answer: "abcd" }}
        initialErrors={{ answer: "Invalid email" }}
        onSubmit={vi.fn()}
        validateOnChange={false}
      >
        {kind === "input" ? (
          <TextInput id="answer" name="answer" type="text" maxLength={2} />
        ) : (
          <TextArea id="answer" name="answer" maxLength={2} />
        )}
      </Formik>
    );
    expect(
      screen.getByText(i18n.t("formElements.characterCount.exceeded", { count: 2 }))
    ).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "ab" } });
    expect(screen.getByTestId("errorMessage")).toHaveTextContent("Invalid email");
  });
});

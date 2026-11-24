/**
 * @vitest-environment jsdom
 */
import React from "react";
import { createInstance } from "i18next";
import {
  Formik,
  FormikProvider,
  Form,
  useField,
  useFormik,
  useFormikContext,
  getIn,
  setIn,
} from "formik";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { isFieldResponseValid } from "@gcforms/core";
import {
  FormElementTypes,
  type FormElement,
  type Language,
  type Responses,
  type ValidationProperties,
} from "@gcforms/types";
import { TextInput } from "@clientComponents/forms/TextInput/TextInput";
import { TextArea } from "@clientComponents/forms/TextArea/TextArea";
import { DynamicGroup } from "@clientComponents/forms/DynamicRow/DynamicRow";
import {
  StructuredErrorsContext,
  useFormattedFormik,
} from "@clientComponents/forms/Form/StructuredErrors";
import en from "../../../i18n/translations/en/common.json";
import fr from "../../../i18n/translations/fr/common.json";

const i18n = createInstance();
vi.mock("@i18n/client", () => ({
  useTranslation: (_namespace: string, options?: { lng?: string }) => ({
    t: i18n.getFixedT(options?.lng ?? "en", "common"),
  }),
}));
beforeAll(async () => {
  await i18n.init({
    resources: { en: { common: en }, fr: { common: fr } },
    lng: "en",
    defaultNS: "common",
  });
});
afterEach(cleanup);

const Summary = ({ name }: { name: string }) => {
  const formik = useFormikContext<Responses>();
  const [, , helpers] = useField(name);
  return (
    <>
      <div data-testid="summary">{getIn(formik.errors, name)}</div>
      <button type="button" onClick={() => formik.setErrors({})}>
        Clear
      </button>
      <button type="button" onClick={() => helpers.setError(undefined)}>
        Clear field
      </button>
      <button type="button" onClick={() => helpers.setError("External error")}>
        External field error
      </button>
      <button type="button" onClick={() => formik.setErrors(setIn({}, name, "External error"))}>
        External errors
      </button>
      <button
        type="button"
        onClick={() => formik.setFormikState((state) => ({ ...state, errors: {} }))}
      >
        Clear state
      </button>
      <button
        type="button"
        onClick={() => formik.setFormikState((state) => ({ ...state, touched: {} }))}
      >
        Touch state
      </button>
      <button type="button" onClick={() => formik.resetForm()}>
        Reset
      </button>
    </>
  );
};

const ValidatedForm = ({
  name = "1",
  kind = "input",
  language = "en",
  validation = { required: true, maxLength: 2 },
  initialValue = "",
  initialRows,
  renderRows = false,
}: {
  name?: string;
  kind?: "input" | "textarea";
  language?: Language;
  validation?: ValidationProperties;
  initialValue?: string;
  initialRows?: string[];
  renderRows?: boolean;
}) => {
  const field: FormElement = {
    id: 1,
    type: kind === "input" ? FormElementTypes.textField : FormElementTypes.textArea,
    properties: { titleEn: "Question", titleFr: "Question FR", validation },
  };
  const repeating = name.includes(".");
  const element: FormElement = repeating
    ? {
        id: 2,
        type: FormElementTypes.dynamicRow,
        properties: {
          titleEn: "Rows",
          titleFr: "Rangées",
          validation: { required: false },
          subElements: [field],
        },
      }
    : field;
  const raw = useFormik<Responses>({
    initialValues: repeating
      ? { 2: (initialRows ?? [initialValue]).map((value) => ({ 0: value })) }
      : { 1: initialValue },
    validateOnChange: false,
    validateOnBlur: false,
    validate: (values) => {
      const error = isFieldResponseValid(values[element.id], element);
      return error ? { [element.id]: error } : {};
    },
    onSubmit: vi.fn(),
  });
  const { formik, structuredErrors } = useFormattedFormik(
    raw,
    [element],
    language,
    i18n.getFixedT(language, "common")
  );
  const fieldProps = {
    id: `field-${name}`,
    name,
    maxLength: validation.maxLength,
    required: validation.required,
    lang: language,
  };
  return (
    <StructuredErrorsContext.Provider value={structuredErrors}>
      <FormikProvider value={formik}>
        <Form>
          <Summary name={name} />
          {renderRows ? (
            <DynamicGroup name="2" rowElements={[field]} lang={language} />
          ) : kind === "input" ? (
            <TextInput {...fieldProps} type="text" />
          ) : (
            <TextArea {...fieldProps} />
          )}
          <button type="submit">Submit</button>
        </Form>
      </FormikProvider>
    </StructuredErrorsContext.Provider>
  );
};

const change = (value: string) =>
  fireEvent.change(screen.getByRole("textbox"), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Submit" }));

describe.each(["input", "textarea"] as const)("%s character errors", (kind) => {
  test.each(["1", "2.0.0"])(
    "transitions required and submitted length errors for %s",
    async (name) => {
      const { container } = render(<ValidatedForm kind={kind} name={name} />);
      submit();
      await waitFor(() =>
        expect(screen.getByTestId("errorMessage")).toHaveTextContent("Enter an answer for:")
      );
      if (name.includes("."))
        expect(screen.getByTestId("summary")).toHaveTextContent("Entry 1 - Question");
      change("a");
      expect(screen.getByTestId("summary")).toHaveTextContent("Enter an answer for:");
      change("abc");
      await waitFor(() =>
        expect(screen.getByTestId("summary")).toHaveTextContent("exceeded the limit by 1 character")
      );
      expect(container.querySelector(`[id="characterCountMessagefield-${name}"]`)).toBeNull();
      expect(screen.getByTestId("errorMessage").parentElement).toHaveAttribute(
        "aria-live",
        "polite"
      );
      change("abcd");
      expect(screen.getByTestId("summary")).toHaveTextContent("exceeded the limit by 2 characters");
      change("ab");
      await waitFor(() => expect(screen.queryByTestId("errorMessage")).not.toBeInTheDocument());
      expect(screen.getByTestId("summary")).toBeEmptyDOMElement();
      change("abc");
      expect(screen.getByText("You've exceeded the limit by 1 character.")).toBeInTheDocument();
      expect(screen.queryByTestId("errorMessage")).not.toBeInTheDocument();
    }
  );

  test.each(["en", "fr"] as const)(
    "uses codes with altered %s translations and no questionLabel",
    async (language) => {
      const originalRequired = i18n.t("input-validation.error-list.default", { lng: language });
      const originalExceeded = i18n.t("formElements.characterCount.exceeded_one", {
        lng: language,
      });
      i18n.addResource(
        language,
        "common",
        "input-validation.error-list.default",
        "REQUIRED {{question}}"
      );
      i18n.addResource(
        language,
        "common",
        "formElements.characterCount.exceeded_one",
        "OVER {{count}}"
      );
      try {
        render(<ValidatedForm kind={kind} language={language} />);
        submit();
        await waitFor(() => expect(screen.getByTestId("summary")).toHaveTextContent("REQUIRED"));
        change("abc");
        expect(screen.getByTestId("summary")).toHaveTextContent(
          `OVER 1: ${language === "fr" ? "Question FR" : "Question"}`
        );
        expect(screen.getByRole("textbox").getAttribute("aria-describedby")).not.toContain(
          "characterCountMessage"
        );
        change("ab");
        expect(screen.getByTestId("summary")).toBeEmptyDOMElement();
      } finally {
        i18n.addResource(
          language,
          "common",
          "input-validation.error-list.default",
          originalRequired
        );
        i18n.addResource(
          language,
          "common",
          "formElements.characterCount.exceeded_one",
          originalExceeded
        );
      }
    }
  );

  test("counts prefilled values immediately, then deduplicates submitted errors", async () => {
    render(<ValidatedForm kind={kind} initialValue="abc" />);
    expect(screen.getByText("You've exceeded the limit by 1 character.")).toBeInTheDocument();
    expect(screen.queryByTestId("errorMessage")).not.toBeInTheDocument();
    submit();
    await waitFor(() =>
      expect(screen.getByTestId("summary")).toHaveTextContent("exceeded the limit")
    );
    expect(screen.queryByText("You've exceeded the limit by 1 character.")).not.toBeInTheDocument();
    change("");
    expect(screen.getByTestId("summary")).toHaveTextContent("Enter an answer for:");
  });

  test.each(["Clear", "Clear field", "Clear state", "Reset"])(
    "%s removes codes as well as messages",
    async (action) => {
      render(<ValidatedForm kind={kind} initialValue="abc" />);
      submit();
      await waitFor(() =>
        expect(screen.getByTestId("summary")).toHaveTextContent("exceeded the limit")
      );
      fireEvent.click(screen.getByRole("button", { name: action }));
      change("abcd");
      expect(screen.getByTestId("summary")).toBeEmptyDOMElement();
      expect(screen.queryByTestId("errorMessage")).not.toBeInTheDocument();
      expect(screen.getByText("You've exceeded the limit by 2 characters.")).toBeInTheDocument();
    }
  );

  test.each([
    ["1", "External field error"],
    ["2.0.0", "External errors"],
  ])("%s %s replaces code ownership", async (name, action) => {
    render(<ValidatedForm kind={kind} name={name} initialValue="abc" />);
    submit();
    await waitFor(() =>
      expect(screen.getByTestId("summary")).toHaveTextContent("exceeded the limit")
    );
    fireEvent.click(screen.getByRole("button", { name: action }));
    change("abcd");
    expect(screen.getByTestId("summary")).toHaveTextContent("External error");
    expect(screen.getByText("You've exceeded the limit by 2 characters.")).toBeInTheDocument();
    change("a");
    expect(screen.getByTestId("summary")).toHaveTextContent("External error");
  });

  test("unrelated state updates preserve structured errors", async () => {
    render(<ValidatedForm kind={kind} initialValue="abc" />);
    submit();
    await waitFor(() =>
      expect(screen.getByTestId("summary")).toHaveTextContent("exceeded the limit")
    );
    fireEvent.click(screen.getByRole("button", { name: "Touch state" }));
    change("abcd");
    expect(screen.getByTestId("summary")).toHaveTextContent("exceeded the limit by 2 characters");
  });

  test("plain Formik keeps opaque string errors and immediate count feedback", () => {
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
    expect(screen.getByText("You've exceeded the limit by 2 characters.")).toBeInTheDocument();
    change("ab");
    expect(screen.getByTestId("errorMessage")).toHaveTextContent("Invalid email");
  });
});

test("clearing length revalidates the field and preserves regex priority", async () => {
  render(
    <ValidatedForm
      initialValue="abc"
      validation={{ required: false, maxLength: 2, type: "custom", regex: "^a.*$" }}
    />
  );
  submit();
  await waitFor(() =>
    expect(screen.getByTestId("summary")).toHaveTextContent("exceeded the limit")
  );
  change("b");
  expect(screen.getByTestId("summary")).toHaveTextContent("Enter the correct format");
  change("abc");
  expect(screen.getByTestId("summary")).toHaveTextContent("Enter the correct format");
});

test("required transitions retain global length priority", async () => {
  render(<ValidatedForm />);
  submit();
  await waitFor(() =>
    expect(screen.getByTestId("summary")).toHaveTextContent("Enter an answer for:")
  );
  change("a".repeat(10002));
  expect(screen.getByTestId("summary")).toHaveTextContent("Shorten the response");
  change("a");
  expect(screen.getByTestId("summary")).toHaveTextContent("Shorten the response");
});

test.each(["add", "delete"])(
  "%s repeating rows clears errors and code ownership",
  async (action) => {
    render(<ValidatedForm name="2.0.0" initialRows={["abc", "ab"]} renderRows />);
    submit();
    await waitFor(() =>
      expect(screen.getByTestId("summary")).toHaveTextContent("exceeded the limit")
    );
    fireEvent.click(
      screen.getByTestId(action === "add" ? "add-row-button-2" : "delete-row-button-2.0")
    );
    expect(screen.getByTestId("summary")).toBeEmptyDOMElement();
    const first = screen.getAllByRole("textbox")[0];
    if (action === "delete") expect(first).toHaveValue("ab");
    fireEvent.change(first, { target: { value: "abcd" } });
    expect(screen.queryByTestId("errorMessage")).not.toBeInTheDocument();
    expect(screen.getByText("You've exceeded the limit by 2 characters.")).toBeInTheDocument();
  }
);

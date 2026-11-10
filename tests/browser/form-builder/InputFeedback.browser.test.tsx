import React, { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import {
  InputFeedback,
  inputFeedbackPanelClassName,
} from "@formBuilder/components/shared/InputFeedback";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useTemplateMigrationProblems } from "@lib/store/hooks/useTemplateMigrationProblems";
import { useTemplateValidationProblems } from "@lib/store/hooks/useTemplateValidationProblems";
import { useMigrationProblemFeedback } from "@lib/store/hooks/useMigrationProblemFeedback";
import { FormElementTypes } from "@lib/types";
import { render as renderWithStore } from "./testUtils";
import { Input } from "@formBuilder/components/shared/Input";
import { TextArea } from "@formBuilder/components/shared/TextArea";
import { ExpandingInput } from "@formBuilder/components/shared/ExpandingInput";
import { SelectedElement } from "@formBuilder/[id]/edit/components/SelectedElement";
import { GroupStoreProvider } from "@lib/groups/useGroupStore";
import { setupFonts } from "../helpers/setupFonts";

import "@root/styles/app.css";

vi.mock("@formBuilder/actions", () => ({
  createOrUpdateTemplate: vi.fn(),
  updateTemplate: vi.fn(),
}));

const controls = { Input, TextArea, ExpandingInput };

describe("<InputFeedback />", () => {
  beforeAll(setupFonts);

  it.each([
    { schemaVersion: 1, missing: "en", nested: false },
    { schemaVersion: 1, missing: "fr", nested: false },
    { schemaVersion: 2, missing: "en", nested: false },
    { schemaVersion: 2, missing: "fr", nested: false },
    { schemaVersion: 1, missing: "fr", nested: true },
    { schemaVersion: 2, missing: "fr", nested: true },
  ] as const)(
    "targets the missing $missing choice label in schema $schemaVersion (nested: $nested)",
    async ({ schemaVersion, missing, nested }) => {
      const Example = () => {
        const { form, importTemplate, language, toggle, updateField } = useTemplateStore(
          (state) => ({
            form: state.form,
            importTemplate: state.importTemplate,
            language: state.translationLanguagePriority,
            toggle: state.toggleTranslationLanguagePriority,
            updateField: state.updateField,
          })
        );
        const migrationProblems = useTemplateMigrationProblems();
        const validationProblems = useTemplateValidationProblems();
        useMigrationProblemFeedback([...migrationProblems, ...validationProblems]);
        const parent = form.elements.find(({ id }) => id === 901);
        const element = nested ? parent?.properties.subElements?.[0] : parent;
        const propertyPath = `form.elements[0].properties.${nested ? "subElements[0].properties." : ""}choices[0].${language}`;
        return (
          <>
            <button
              onClick={() => {
                const choice = { en: "Yes", fr: "Oui" };
                Reflect.deleteProperty(choice, missing);
                const choiceElement = {
                  id: nested ? 902 : 901,
                  type: FormElementTypes.dropdown,
                  properties: {
                    titleEn: "Question",
                    titleFr: "Question",
                    validation: { required: false },
                    choices: [choice],
                  },
                };
                const template = structuredClone(form);
                template.schemaVersion = schemaVersion;
                template.elements = nested
                  ? [
                      {
                        id: 901,
                        type: FormElementTypes.dynamicRow,
                        properties: {
                          titleEn: "Group",
                          titleFr: "Group",
                          subElements: [choiceElement],
                        },
                      },
                    ]
                  : [choiceElement];
                template.layout = [901];
                Object.values(template.groups ?? {}).forEach((group) => {
                  group.elements = [];
                });
                if (template.groups) template.groups.start.elements = ["901"];
                importTemplate(template);
              }}
            >
              Load missing label
            </button>
            {element && (
              <>
                <label htmlFor={`option--${element.id}--1`}>Choice label</label>
                <Input
                  id={`option--${element.id}--1`}
                  value={element.properties.choices?.[0]?.[language] ?? ""}
                  onChange={(event) => updateField(propertyPath, event.target.value)}
                />
              </>
            )}
            <button onClick={toggle}>Switch content language</button>
          </>
        );
      };
      await renderWithStore(<Example />);
      await page.getByRole("button", { name: "Load missing label", exact: true }).click();
      const input = page.getByRole("textbox", { name: "Choice label", exact: true });
      const toggle = page.getByRole("button", { name: "Switch content language", exact: true });
      if (missing === "en") await toggle.click();
      await expect.element(input).toHaveValue(missing === "fr" ? "Yes" : "Oui");
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await expect.element(input).not.toHaveAttribute("aria-describedby");
      await toggle.click();
      await expect.element(input).toHaveValue("");
      await expect.element(input).toHaveAttribute("aria-invalid", "true");
      await expect
        .element(input)
        .toHaveAccessibleDescription("A required value is missing from This question.");
      await toggle.click();
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await toggle.click();
      await userEvent.fill(input, "Repaired label");
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await toggle.click();
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
    }
  );

  it.each(Object.keys(controls) as (keyof typeof controls)[])(
    "keeps %s blur errors in their content language when switching languages",
    async (kind) => {
      const Control = controls[kind];
      const Example = () => {
        const [values, setValues] = useState({ en: "", fr: "Question française" });
        const { language, toggle } = useTemplateStore((state) => ({
          language: state.translationLanguagePriority,
          toggle: state.toggleTranslationLanguagePriority,
        }));
        return (
          <>
            <label htmlFor="item-901">Question title</label>
            <Control
              id="item-901"
              value={values[language]}
              onChange={(event) => setValues({ ...values, [language]: event.target.value })}
              checkEmpty="Enter a question title."
            />
            <button onClick={toggle}>Switch content language</button>
            <button>Blur title</button>
          </>
        );
      };
      await renderWithStore(<Example />);
      const input = page.getByRole("textbox", { name: "Question title", exact: true });
      const toggle = page.getByRole("button", { name: "Switch content language", exact: true });
      const blur = page.getByRole("button", { name: "Blur title", exact: true });
      await input.click();
      await toggle.click();
      await expect.element(input).toHaveValue("Question française");
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await expect.element(input).not.toHaveAttribute("aria-describedby");
      await input.click();
      await blur.click();
      await toggle.click();
      await expect.element(input).toHaveValue("");
      await expect.element(input).toHaveAccessibleDescription("Enter a question title.");
      await expect.element(input).toHaveAttribute("aria-invalid", "true");

      await toggle.click();
      await userEvent.fill(input, "");
      await blur.click();
      await expect.element(input).toHaveAttribute("aria-invalid", "true");
      await toggle.click();
      await userEvent.fill(input, "Corrected English title");
      await blur.click();
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await toggle.click();
      await expect.element(input).toHaveAccessibleDescription("Enter a question title.");
      await userEvent.fill(input, "Titre corrigé");
      await blur.click();
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await toggle.click();
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await expect.element(input).toHaveValue("Corrected English title");
    }
  );

  it.each(["en", "fr"] as const)(
    "only displays %s template diagnostics in that content language",
    async (problemLanguage) => {
      const Example = () => {
        const { form, importTemplate, language, toggle } = useTemplateStore((state) => ({
          form: state.form,
          importTemplate: state.importTemplate,
          language: state.translationLanguagePriority,
          toggle: state.toggleTranslationLanguagePriority,
        }));
        useMigrationProblemFeedback([
          {
            path: `elements[0].properties.title${problemLanguage === "en" ? "En" : "Fr"}`,
            name: "type",
            message: "Title must be a string.",
          },
        ]);
        const element = form.elements.find(({ id }) => id === 901);
        return (
          <>
            <button
              onClick={() =>
                importTemplate({
                  ...form,
                  elements: [
                    {
                      id: 901,
                      type: FormElementTypes.textField,
                      properties: { titleEn: "English title", titleFr: "French title" },
                    },
                  ],
                })
              }
            >
              Load title diagnostic
            </button>
            {element && (
              <>
                <label htmlFor="item-901">Question title</label>
                <ExpandingInput
                  id="item-901"
                  value={
                    language === "en"
                      ? (element.properties.titleEn ?? "")
                      : (element.properties.titleFr ?? "")
                  }
                  onChange={vi.fn()}
                />
              </>
            )}
            <button onClick={toggle}>Switch content language</button>
          </>
        );
      };
      await renderWithStore(<Example />);
      await page.getByRole("button", { name: "Load title diagnostic", exact: true }).click();
      const input = page.getByRole("textbox", { name: "Question title", exact: true });
      const toggle = page.getByRole("button", { name: "Switch content language", exact: true });
      if (problemLanguage === "fr") await toggle.click();
      await expect.element(input).toHaveAttribute("aria-invalid", "true");
      const description = input.element().getAttribute("aria-describedby");
      expect(description).toBe("errorMessage-item-901");
      await toggle.click();
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await expect.element(input).not.toHaveAttribute("aria-describedby");
      await toggle.click();
      await expect.element(input).toHaveAttribute("aria-invalid", "true");
      await expect.element(input).toHaveAttribute("aria-describedby", description!);
    }
  );

  it.each([
    { type: FormElementTypes.checkbox, nested: false },
    { type: FormElementTypes.checkbox, nested: true },
    { type: FormElementTypes.radio, nested: false },
    { type: FormElementTypes.radio, nested: true },
    { type: FormElementTypes.dropdown, nested: false },
    { type: FormElementTypes.dropdown, nested: true },
  ])(
    "keeps $type choice rows aligned with stable live errors (nested: $nested)",
    async ({ type, nested }) => {
      const Example = () => {
        const { form, importTemplate } = useTemplateStore((state) => ({
          form: state.form,
          importTemplate: state.importTemplate,
        }));
        useMigrationProblemFeedback(useTemplateMigrationProblems());
        const parent = form.elements.find((element) => element.id === 901);
        const element = nested ? parent?.properties.subElements?.[0] : parent;
        return (
          <div data-testid="choice-editor">
            <button
              onClick={() => {
                const choiceElement = {
                  id: nested ? 902 : 901,
                  type,
                  properties: {
                    titleEn: "Question",
                    titleFr: "Question",
                    choices: [
                      { en: "A", fr: "A" },
                      { en: "B", fr: "A" },
                    ],
                  },
                };
                importTemplate({
                  ...form,
                  schemaVersion: nested ? 1 : 2,
                  elements: nested
                    ? [
                        {
                          id: 901,
                          type: FormElementTypes.dynamicRow,
                          properties: {
                            titleEn: "Group",
                            titleFr: "Group",
                            subElements: [choiceElement],
                          },
                        },
                      ]
                    : [choiceElement],
                });
              }}
            >
              Load choices
            </button>
            {element && (
              <SelectedElement
                item={{ ...element, index: 0 }}
                elIndex={nested ? 0 : -1}
                formId="test-form-id"
              />
            )}
          </div>
        );
      };
      await renderWithStore(
        <GroupStoreProvider>
          <Example />
        </GroupStoreProvider>
      );
      const load = page.getByRole("button", { name: "Load choices", exact: true });
      await load.click();
      const option2 = page.getByPlaceholder("Option 2", { exact: true });
      await userEvent.fill(option2, "A");
      const message = "This choice already exists. Enter a different choice.";
      await expect.element(option2).toHaveFocus();
      await expect.element(option2).toHaveAccessibleDescription(message);
      await expect.element(option2).toHaveAttribute("aria-invalid", "true");
      await expect
        .element(page.getByPlaceholder("Option 1", { exact: true }))
        .toHaveAccessibleDescription(message);
      const errorClass = option2.element().className;
      await userEvent.tab();
      await expect.element(option2).toHaveAccessibleDescription(message);
      expect(option2.element().className).toBe(errorClass);
      expect(document.querySelectorAll('[role="alert"]:not(:empty)')).toHaveLength(2);
      for (const width of [280, 700]) {
        const editor = page.getByTestId("choice-editor").element() as HTMLElement;
        editor.style.width = `${width}px`;
        for (const index of [1, 2]) {
          const input = page.getByPlaceholder(`Option ${index}`, { exact: true }).element();
          const remove = document.getElementById(`remove--${nested ? 902 : 901}--${index}`)!;
          const row = remove.parentElement!;
          expect(row.children).toHaveLength(2);
          expect(remove.querySelectorAll("svg")).toHaveLength(1);
          const inputBounds = input.getBoundingClientRect();
          const removeBounds = remove.getBoundingClientRect();
          expect(inputBounds.width).toBeGreaterThan(0);
          expect(removeBounds.width).toBeGreaterThanOrEqual(32);
          expect(inputBounds.left).toBeCloseTo(row.getBoundingClientRect().left, 1);
          expect(inputBounds.right).toBeLessThanOrEqual(removeBounds.left - 7);
          expect(removeBounds.right).toBeLessThanOrEqual(editor.getBoundingClientRect().right);
        }
      }
      await userEvent.fill(option2, "B");
      await expect.element(option2).not.toHaveAttribute("aria-invalid", "true");
      await expect
        .element(page.getByPlaceholder("Option 1", { exact: true }))
        .not.toHaveAttribute("aria-invalid", "true");
    }
  );

  it.each(Object.keys(controls) as (keyof typeof controls)[])(
    "checks empty %s values on blur through the template store",
    async (kind) => {
      const Control = controls[kind];
      const Example = () => {
        const [value, setValue] = useState("");
        const { feedback, setInputFeedback } = useTemplateStore((state) => ({
          feedback: state.inputFeedback["en:required-field"],
          setInputFeedback: state.setInputFeedback,
        }));
        return (
          <>
            <label htmlFor="required-field">Required field</label>
            <p id="required-hint">Use a descriptive title.</p>
            <Control
              id="required-field"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              describedBy="required-hint"
              checkEmpty="Enter a title."
            />
            <label htmlFor="optional-field">Optional field</label>
            <Control id="optional-field" value="" onChange={vi.fn()} />
            <output data-testid="stored-feedback">{JSON.stringify(feedback ?? null)}</output>
            <button type="button">Blur field</button>
            <button
              type="button"
              onClick={() =>
                setInputFeedback("required-field", {
                  state: "conflict",
                  message: "Review this title.",
                })
              }
            >
              Show other feedback
            </button>
          </>
        );
      };
      await renderWithStore(<Example />);
      const control = page.getByRole("textbox", { name: "Required field", exact: true });
      const blur = page.getByRole("button", { name: "Blur field", exact: true });
      await expect.element(control).not.toHaveAttribute("aria-invalid", "true");
      await userEvent.click(control);
      await userEvent.click(blur);
      await expect.element(control).toHaveAttribute("aria-invalid", "true");
      await expect
        .element(control)
        .toHaveAccessibleDescription("Enter a title. Use a descriptive title.");
      await expect
        .element(control)
        .toHaveAttribute("aria-describedby", "errorMessage-required-field required-hint");
      await expect.element(page.getByRole("alert")).toHaveTextContent("Enter a title.");
      await expect
        .element(page.getByTestId("stored-feedback"))
        .toHaveTextContent('{"state":"error","message":"Enter a title."}');

      await userEvent.fill(control, "   ");
      await userEvent.click(blur);
      await expect.element(control).toHaveAttribute("aria-invalid", "true");
      await userEvent.fill(control, "Delivery address");
      await expect.element(control).toHaveAttribute("aria-invalid", "true");
      await userEvent.click(blur);
      await expect.element(control).not.toHaveAttribute("aria-invalid", "true");
      await expect.element(control).toHaveAccessibleDescription("Use a descriptive title.");
      await expect.element(page.getByTestId("stored-feedback")).toHaveTextContent("null");

      await userEvent.click(page.getByRole("button", { name: "Show other feedback", exact: true }));
      await userEvent.click(control);
      await userEvent.click(blur);
      await expect
        .element(control)
        .toHaveAccessibleDescription("Review this title. Use a descriptive title.");

      const optional = page.getByRole("textbox", { name: "Optional field", exact: true });
      await userEvent.click(optional);
      await userEvent.click(blur);
      await expect.element(optional).not.toHaveAttribute("aria-invalid", "true");
    }
  );

  it("flags duplicates immediately with unchanged feedback on blur, and keeps the value", async () => {
    const Example = () => {
      const [value, setValue] = useState("");
      return (
        <>
          <Input
            id="option--1--2"
            ariaLabel="Option 2"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            checkDuplicate={{ values: ["Yes", "No"], message: "This choice already exists." }}
          />
          <button type="button">Add option</button>
        </>
      );
    };
    await renderWithStore(<Example />);
    const control = page.getByRole("textbox", { name: "Option 2", exact: true });
    const button = page.getByRole("button", { name: "Add option", exact: true });
    const alert = page.getByRole("alert");
    const before = button.element().getBoundingClientRect().top;

    await expect.element(alert).toBeInTheDocument();
    expect(alert.element().getBoundingClientRect().height).toBe(0);
    expect(button.element().getBoundingClientRect().top).toBe(before);

    await userEvent.click(control);
    await userEvent.click(button);
    await expect.element(control).not.toHaveAttribute("aria-invalid", "true");

    await userEvent.fill(control, "yes");
    await userEvent.click(button);
    await expect.element(control).not.toHaveAttribute("aria-invalid", "true");

    await userEvent.fill(control, "Yes");
    await expect.element(control).toHaveFocus();
    await expect.element(control).toHaveAttribute("aria-invalid", "true");
    await expect.element(control).toHaveValue("Yes");
    await expect.element(control).toHaveAccessibleDescription("This choice already exists.");
    expect(page.getByRole("alert").element()).toBe(alert.element());
    await expect.element(alert).toHaveTextContent("This choice already exists.");
    const invalidClass = control.element().className;
    await userEvent.click(button);
    await expect.element(control).toHaveAccessibleDescription("This choice already exists.");
    expect(control.element().className).toBe(invalidClass);

    await userEvent.fill(control, "Maybe");
    await expect.element(control).not.toHaveAttribute("aria-invalid", "true");
    await expect.element(control).toHaveFocus();
    await expect.element(alert).toHaveTextContent("");
  });

  it("clears a duplicate error when the other values change", async () => {
    const Example = () => {
      const [values, setValues] = useState(["c", "b", "c"]);
      return (
        <>
          {values.map((value, index) => (
            <Input
              key={index}
              id={`option--1--${index + 1}`}
              ariaLabel={`Option ${index + 1}`}
              value={value}
              onChange={(event) =>
                setValues(values.map((v, i) => (i === index ? event.target.value : v)))
              }
              checkDuplicate={{
                values: values.filter((v, i) => i !== index && v),
                message: "This choice already exists.",
              }}
            />
          ))}
          <button type="button" onClick={() => setValues(values.slice(1))}>
            Remove option 1
          </button>
        </>
      );
    };
    await renderWithStore(<Example />);
    const option3 = page.getByRole("textbox", { name: "Option 3", exact: true });

    await userEvent.click(option3);
    await userEvent.tab();
    await expect.element(option3).toHaveAttribute("aria-invalid", "true");

    await userEvent.click(page.getByRole("button", { name: "Remove option 1" }));
    await expect.element(option3).not.toBeInTheDocument();
    for (const name of ["Option 1", "Option 2"]) {
      expect(
        page.getByRole("textbox", { name, exact: true }).element().getAttribute("aria-invalid")
      ).not.toBe("true");
    }
    expect(document.querySelectorAll('[role="alert"]:not(:empty)')).toHaveLength(0);
  });

  it("clears a duplicate error when the sibling value is edited", async () => {
    const Example = () => {
      const [values, setValues] = useState(["c", "c"]);
      return (
        <>
          {values.map((value, index) => (
            <Input
              key={index}
              id={`option--1--${index + 1}`}
              ariaLabel={`Option ${index + 1}`}
              value={value}
              onChange={(event) =>
                setValues(values.map((v, i) => (i === index ? event.target.value : v)))
              }
              checkDuplicate={{
                values: values.filter((v, i) => i !== index && v),
                message: "This choice already exists.",
              }}
            />
          ))}
        </>
      );
    };
    await renderWithStore(<Example />);
    const option1 = page.getByRole("textbox", { name: "Option 1", exact: true });
    const option2 = page.getByRole("textbox", { name: "Option 2", exact: true });

    await userEvent.click(option2);
    await userEvent.tab();
    await expect.element(option2).toHaveAttribute("aria-invalid", "true");

    await userEvent.fill(option1, "d");
    await expect.element(option2).not.toHaveAttribute("aria-invalid", "true");
    await expect.element(option2).toHaveValue("c");
  });

  it("preserves the expanding input blur handler when checking empty values", async () => {
    const onBlur = vi.fn();
    const onClick = vi.fn();
    await renderWithStore(
      <>
        <ExpandingInput
          id="question-blur"
          ariaLabel="Question"
          value=""
          onChange={vi.fn()}
          onBlur={onBlur}
          checkEmpty="Enter a question title."
        />
        <button type="button" onClick={onClick}>
          Blur question
        </button>
      </>
    );
    const control = page.getByRole("textbox", { name: "Question", exact: true });
    const button = page.getByRole("button", { name: "Blur question", exact: true });
    const before = button.element().getBoundingClientRect();
    await expect.element(control).not.toHaveAttribute("aria-describedby");
    await expect.element(page.getByText("Enter a question title.")).not.toBeVisible();
    const alert = page.getByRole("alert");
    await expect.element(alert).toBeInTheDocument();
    expect(alert.element().textContent).toBe("Enter a question title.");
    expect(alert.element().querySelector("[aria-hidden=true]")).not.toBeNull();
    await userEvent.click(control);
    await userEvent.click(button);
    expect(onBlur).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
    expect(button.element().getBoundingClientRect().top).toBe(before.top);
    await expect.element(control).toHaveAccessibleDescription("Enter a question title.");
    // The live region is the same element, so screen readers announce the new text.
    expect(page.getByRole("alert").element()).toBe(alert.element());
    expect(alert.element().querySelector("[aria-hidden=true]")).toBeNull();
    await expect.element(alert).toHaveTextContent("Enter a question title.");
  });

  it("maps migration problems to the affected choices and clears them after correction", async () => {
    const Example = () => {
      const { form, importTemplate, updateField } = useTemplateStore((state) => ({
        form: state.form,
        importTemplate: state.importTemplate,
        updateField: state.updateField,
      }));
      const problems = useTemplateMigrationProblems();
      useMigrationProblemFeedback(problems);
      const elementIndex = form.elements.findIndex((element) => element.id === 901);
      const element = form.elements[elementIndex];
      return (
        <>
          <button
            onClick={async () => {
              const template = structuredClone(form);
              template.schemaVersion = 1;
              template.layout = [901];
              template.elements = [
                {
                  id: 901,
                  type: FormElementTypes.radio,
                  properties: {
                    titleEn: "My radio inputs",
                    titleFr: "Mes choix",
                    validation: { required: false },
                    choices: [
                      { en: "a", fr: "a" },
                      { en: "a", fr: "a" },
                      { en: "c", fr: "c" },
                    ],
                  },
                },
              ];
              await importTemplate(template);
            }}
          >
            Load migration issue
          </button>
          {element?.properties.choices?.map((choice, index) => (
            <div key={index}>
              <label htmlFor={`option--901--${index + 1}`}>Choice {index + 1}</label>
              <Input
                id={`option--901--${index + 1}`}
                value={choice.en}
                onChange={(event) =>
                  updateField(
                    `form.elements[${elementIndex}].properties.choices[${index}].en`,
                    event.target.value
                  )
                }
              />
            </div>
          ))}
        </>
      );
    };
    await renderWithStore(<Example />);
    await userEvent.click(page.getByRole("button", { name: "Load migration issue", exact: true }));
    const first = page.getByRole("textbox", { name: "Choice 1", exact: true });
    const second = page.getByRole("textbox", { name: "Choice 2", exact: true });
    const third = page.getByRole("textbox", { name: "Choice 3", exact: true });
    await expect.element(first).toHaveAttribute("aria-invalid", "true");
    await expect.element(second).toHaveAttribute("aria-invalid", "true");
    await expect.element(third).not.toHaveAttribute("aria-invalid", "true");
    await expect
      .element(page.getByText("This choice already exists. Enter a different choice.").first())
      .toBeVisible();
    await userEvent.fill(second, "b");
    await expect.element(first).not.toHaveAttribute("aria-invalid", "true");
    await expect.element(second).not.toHaveAttribute("aria-invalid", "true");
  });

  it.each([1, 2])(
    "keeps local feedback independent of template diagnostics for schema %s",
    async (schemaVersion) => {
      const TemplateFeedback = () => {
        const migrationProblems = useTemplateMigrationProblems();
        const validationProblems = useTemplateValidationProblems();
        useMigrationProblemFeedback([...migrationProblems, ...validationProblems]);
        return null;
      };
      const Example = () => {
        const [showDiagnostics, setShowDiagnostics] = useState(true);
        const { form, importTemplate, updateField, setInputFeedback } = useTemplateStore(
          (state) => ({
            form: state.form,
            importTemplate: state.importTemplate,
            updateField: state.updateField,
            setInputFeedback: state.setInputFeedback,
          })
        );
        const choices = form.elements[0]?.properties.choices;
        return (
          <>
            {showDiagnostics && <TemplateFeedback />}
            <button
              onClick={() => {
                const template = structuredClone(form);
                template.schemaVersion = schemaVersion;
                template.layout = [901];
                template.elements = [
                  {
                    id: 901,
                    type: FormElementTypes.dropdown,
                    properties: {
                      titleEn: "Question",
                      titleFr: "Question",
                      validation: { required: false },
                      choices: [
                        { en: "A", fr: "A" },
                        { en: "A", fr: "A" },
                      ],
                    },
                  },
                ];
                Object.values(template.groups ?? {}).forEach((group) => {
                  group.elements = [];
                });
                if (template.groups) template.groups.start.elements = ["901"];
                return importTemplate(template);
              }}
            >
              Load duplicates
            </button>
            {choices && (
              <Input
                id="option--901--1"
                ariaLabel="First English choice"
                value={choices[0].en}
                onChange={vi.fn()}
              />
            )}
            <button onClick={() => setInputFeedback("option--901--1", null)}>
              Clear local feedback
            </button>
            <button
              onClick={() =>
                setInputFeedback("option--901--1", {
                  state: "error",
                  message: "Independent local error.",
                })
              }
            >
              Show local feedback
            </button>
            <button onClick={() => setShowDiagnostics((show) => !show)}>
              Toggle template diagnostics
            </button>
            <button onClick={() => updateField("form.elements[0].properties.choices[1].fr", "B")}>
              Change other French label
            </button>
            <button onClick={() => updateField("form.elements[0].properties.choices[1].en", "B")}>
              Change other English label
            </button>
          </>
        );
      };
      await renderWithStore(<Example />);
      await page.getByRole("button", { name: "Load duplicates", exact: true }).click();
      const input = page.getByRole("textbox", { name: "First English choice", exact: true });
      const warning = "This choice already exists. Enter a different choice.";
      await expect.element(input).toHaveAccessibleDescription(warning);
      await page.getByRole("button", { name: "Show local feedback", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription("Independent local error.");

      await page.getByRole("button", { name: "Toggle template diagnostics", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription("Independent local error.");
      await page.getByRole("button", { name: "Clear local feedback", exact: true }).click();
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
      await page.getByRole("button", { name: "Toggle template diagnostics", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription(warning);
      await page.getByRole("button", { name: "Show local feedback", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription("Independent local error.");

      await page.getByRole("button", { name: "Clear local feedback", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription(warning);
      await page.getByRole("button", { name: "Show local feedback", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription("Independent local error.");

      await page.getByRole("button", { name: "Change other French label", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription("Independent local error.");
      await expect.element(input).toHaveAttribute("aria-invalid", "true");
      await page.getByRole("button", { name: "Change other English label", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription("Independent local error.");
      await page.getByRole("button", { name: "Clear local feedback", exact: true }).click();
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
    }
  );

  it.each([
    { local: "error", template: "conflict", message: "Local feedback." },
    { local: "conflict", template: "error", message: "Template feedback." },
    { local: "error", template: "error", message: "Local feedback." },
    { local: "conflict", template: "conflict", message: "Local feedback." },
  ] as const)(
    "prioritizes $local local feedback and $template template feedback",
    async ({ local, template, message }) => {
      const Example = () => {
        const { setInputFeedback, setTemplateProblemFeedback } = useTemplateStore((state) => ({
          setInputFeedback: state.setInputFeedback,
          setTemplateProblemFeedback: state.setTemplateProblemFeedback,
        }));
        return (
          <>
            <Input id="priority" ariaLabel="Choice" value="A" onChange={vi.fn()} />
            <button
              onClick={() => {
                setInputFeedback("priority", { state: local, message: "Local feedback." });
                setTemplateProblemFeedback({
                  "en:priority": { state: template, message: "Template feedback." },
                });
              }}
            >
              Show both sources
            </button>
            <button onClick={() => setInputFeedback("priority", null)}>Clear local source</button>
            <button onClick={() => setTemplateProblemFeedback({})}>Clear template source</button>
          </>
        );
      };
      await renderWithStore(<Example />);
      const input = page.getByRole("textbox", { name: "Choice", exact: true });
      await page.getByRole("button", { name: "Show both sources", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription(message);
      await page.getByRole("button", { name: "Clear local source", exact: true }).click();
      await expect.element(input).toHaveAccessibleDescription("Template feedback.");
      await page.getByRole("button", { name: "Clear template source", exact: true }).click();
      await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
    }
  );

  it.each([undefined, "conflict", "error"] as const)(
    "highlights panels for child errors, not conflicts: %s",
    async (state) => {
      const panel = (feedbackState?: "error" | "conflict") => (
        <>
          <div data-testid="error-background-reference" className="bg-gray-50" aria-hidden="true" />
          <div
            data-testid="feedback-panel"
            className={`bg-white p-4 focus-within:bg-violet-50 hover:bg-violet-50 ${inputFeedbackPanelClassName}`}
          >
            <label htmlFor="panel-choice">Panel choice</label>
            <InputFeedback state={feedbackState} message="Check this choice.">
              <Input id="panel-choice" value="Delivery" onChange={vi.fn()} />
            </InputFeedback>
          </div>
        </>
      );
      const { rerender } = await render(panel(state));
      const panelElement = page.getByTestId("feedback-panel");
      const errorColor = getComputedStyle(
        page.getByTestId("error-background-reference").element()
      ).backgroundColor;
      const background = () => getComputedStyle(panelElement.element()).backgroundColor;
      expect(background() === errorColor).toBe(state === "error");
      await userEvent.hover(panelElement);
      expect(background() === errorColor).toBe(state === "error");
      await userEvent.click(page.getByRole("textbox", { name: "Panel choice", exact: true }));
      expect(background() === errorColor).toBe(state === "error");

      await rerender(panel());
      expect(background()).not.toBe(errorColor);
    }
  );

  it.each([360, 1024])(
    "keeps option widths equal across feedback states at %s px",
    async (width) => {
      await page.viewport(width, 800);
      const options = [
        { id: "error-option", state: "error" as const, message: "Enter an option." },
        {
          id: "conflict-option",
          state: "conflict" as const,
          message:
            "This is a much longer conflict message that must wrap without changing the input width.",
        },
        { id: "normal-option", state: undefined, message: undefined },
      ];
      await render(
        <div className="w-full max-w-160">
          {options.map(({ id, state, message }) => (
            <div className="mt-3 flex gap-2" key={id}>
              <InputFeedback state={state} message={message}>
                <Input
                  id={id}
                  ariaLabel={id}
                  value="Delivery option"
                  onChange={vi.fn()}
                  className="my-0! w-full"
                />
              </InputFeedback>
              <button type="button" className="size-9 shrink-0" aria-label={`Remove ${id}`}>
                X
              </button>
            </div>
          ))}
        </div>
      );
      const bounds = options.map(({ id }) =>
        page.getByRole("textbox", { name: id, exact: true }).element().getBoundingClientRect()
      );
      expect(bounds[0].width).toBeGreaterThan(0);
      for (const bound of bounds) {
        expect(bound.width).toBeCloseTo(bounds[0].width, 1);
        expect(bound.left).toBeCloseTo(bounds[0].left, 1);
        expect(bound.right).toBeLessThanOrEqual(width);
      }
    }
  );

  it.each(Object.keys(controls) as (keyof typeof controls)[])(
    "updates %s from store feedback and clears it without losing focus",
    async (kind) => {
      const Control = controls[kind];
      const Example = () => {
        const [value, setValue] = useState("Standard delivery");
        const { setInputFeedback, clearInputFeedback } = useTemplateStore((state) => ({
          setInputFeedback: state.setInputFeedback,
          clearInputFeedback: state.clearInputFeedback,
        }));
        return (
          <>
            <label htmlFor="stored-choice">Choice</label>
            <p id="stored-hint">Use a distinct name.</p>
            <Control
              id="stored-choice"
              value={value}
              describedBy="stored-hint"
              onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setValue(event.target.value);
                setInputFeedback("stored-choice", null);
              }}
            />
            <label htmlFor="unaffected">Unaffected</label>
            <Input id="unaffected" value="Other choice" onChange={vi.fn()} />
            <button
              onClick={() =>
                setInputFeedback("stored-choice", {
                  state: "conflict",
                  message: "Duplicate choice label.",
                })
              }
            >
              Show conflict
            </button>
            <button
              onClick={() =>
                setInputFeedback("stored-choice", { state: "error", message: "Enter a choice." })
              }
            >
              Show error
            </button>
            <button onClick={clearInputFeedback}>Clear feedback</button>
          </>
        );
      };
      await renderWithStore(<Example />);
      const control = page.getByRole("textbox", { name: "Choice", exact: true });
      await expect.element(control).not.toHaveAttribute("aria-invalid", "true");
      await userEvent.click(page.getByRole("button", { name: "Show conflict", exact: true }));
      await expect
        .element(control)
        .toHaveAccessibleDescription("Duplicate choice label. Use a distinct name.");
      await expect.element(control).toHaveAttribute("aria-invalid", "true");
      await expect
        .element(page.getByRole("textbox", { name: "Unaffected", exact: true }))
        .not.toHaveAttribute("aria-invalid", "true");
      await userEvent.click(page.getByRole("button", { name: "Show error", exact: true }));
      await expect
        .element(control)
        .toHaveAccessibleDescription("Enter a choice. Use a distinct name.");
      await userEvent.fill(control, "Express delivery");
      await expect.element(control).toHaveFocus();
      await expect.element(control).not.toHaveAttribute("aria-invalid", "true");
      await expect.element(control).toHaveAccessibleDescription("Use a distinct name.");
      await userEvent.click(page.getByRole("button", { name: "Show error", exact: true }));
      await userEvent.click(page.getByRole("button", { name: "Clear feedback", exact: true }));
      await expect.element(control).not.toHaveAttribute("aria-invalid", "true");
    }
  );

  it.each(Object.keys(controls) as (keyof typeof controls)[])(
    "styles and describes error/conflict states for %s without replacing existing hints",
    async (kind) => {
      const Control = controls[kind];
      const onChange = vi.fn();
      const { rerender } = await render(
        <>
          <label htmlFor="choice">Choice</label>
          <p id="choice-hint">Use a distinct name.</p>
          <InputFeedback state="conflict" message="Duplicate choice label.">
            <Control
              id="choice"
              value="Standard delivery"
              onChange={onChange}
              describedBy="choice-hint"
              className="w-full"
            />
          </InputFeedback>
        </>
      );
      const control = page.getByRole("textbox", { name: "Choice" });
      await expect.element(control).toHaveAttribute("aria-invalid", "true");
      await expect
        .element(control)
        .toHaveAccessibleDescription("Duplicate choice label. Use a distinct name.");
      await expect.element(page.getByText("Duplicate choice label.")).toBeVisible();
      await expect
        .element(page.getByText("Duplicate choice label."))
        .toHaveClass("text-(--gcds-color-yellow-700)");
      await expect
        .element(page.getByText("Duplicate choice label."))
        .not.toHaveClass("bg-yellow-100");
      const borderTarget =
        control.element().closest<HTMLDivElement>(".input-sizer") ?? control.element();
      await expect.element(borderTarget).not.toHaveClass("border-yellow-500");
      await expect.element(borderTarget).not.toHaveClass("bg-yellow-50");
      await expect.element(page.getByTestId("WarningIcon")).toBeVisible();
      await userEvent.fill(control, "Express delivery");
      expect(onChange).toHaveBeenCalled();

      await rerender(
        <>
          <label htmlFor="choice">Choice</label>
          <InputFeedback state="error" message="Option label cannot be empty.">
            <Control id="choice" value="" onChange={onChange} className="w-full" />
          </InputFeedback>
        </>
      );
      await expect.element(control).toHaveAccessibleDescription("Option label cannot be empty.");
      await expect.element(control).toHaveAttribute("aria-invalid", "true");
      await expect.element(page.getByText("Duplicate choice label.")).not.toBeInTheDocument();

      await rerender(
        <>
          <label htmlFor="choice">Choice</label>
          <InputFeedback message="No longer relevant">
            <Control id="choice" value="Express delivery" onChange={onChange} />
          </InputFeedback>
        </>
      );
      await expect.element(control).not.toHaveAttribute("aria-invalid", "true");
      await expect.element(control).not.toHaveAttribute("aria-describedby");
      await expect.element(page.getByText("Option label cannot be empty.")).not.toBeInTheDocument();
      await expect.element(page.getByText("No longer relevant")).not.toBeInTheDocument();
    }
  );

  it("keeps controls independent and preserves focus while feedback changes", async () => {
    const Example = () => {
      const [value, setValue] = useState("");
      return (
        <>
          <label htmlFor="first">First choice</label>
          <InputFeedback state={value ? undefined : "error"} message="Enter a choice.">
            <Input id="first" value={value} onChange={(event) => setValue(event.target.value)} />
          </InputFeedback>
          <label htmlFor="second">Second choice</label>
          <InputFeedback state="conflict" message="Duplicate choice.">
            <Input id="second" value="Standard delivery" onChange={vi.fn()} />
          </InputFeedback>
        </>
      );
    };
    await render(<Example />);
    const first = page.getByRole("textbox", { name: "First choice" });
    const second = page.getByRole("textbox", { name: "Second choice" });
    expect(first.element().getAttribute("aria-describedby")).not.toBe(
      second.element().getAttribute("aria-describedby")
    );
    await userEvent.fill(first, "Express delivery");
    await expect.element(first).toHaveFocus();
    await expect.element(first).not.toHaveAttribute("aria-invalid", "true");
    await expect.element(second).toHaveAccessibleDescription("Duplicate choice.");
  });
});

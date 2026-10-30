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
import { useMigrationProblemFeedback } from "@lib/store/hooks/useMigrationProblemFeedback";
import { FormElementTypes } from "@lib/types";
import { render as renderWithStore } from "./testUtils";
import { Input } from "@formBuilder/components/shared/Input";
import { TextArea } from "@formBuilder/components/shared/TextArea";
import { ExpandingInput } from "@formBuilder/components/shared/ExpandingInput";
import { setupFonts } from "../helpers/setupFonts";

import "@root/styles/app.css";

const controls = { Input, TextArea, ExpandingInput };

describe("<InputFeedback />", () => {
  beforeAll(setupFonts);

  it.each(Object.keys(controls) as (keyof typeof controls)[])(
    "checks empty %s values on blur through the template store",
    async (kind) => {
      const Control = controls[kind];
      const Example = () => {
        const [value, setValue] = useState("");
        const { feedback, setInputFeedback } = useTemplateStore((state) => ({
          feedback: state.inputFeedback["required-field"],
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
      .element(
        page.getByText("Duplicate choices: a. Remove or change the repeated choices.").first()
      )
      .toBeVisible();
    await userEvent.fill(second, "b");
    await expect.element(first).not.toHaveAttribute("aria-invalid", "true");
    await expect.element(second).not.toHaveAttribute("aria-invalid", "true");
  });

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

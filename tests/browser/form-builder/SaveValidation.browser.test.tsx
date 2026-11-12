import { beforeAll, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { SaveTemplateProvider } from "@lib/hooks/form-builder/useTemplateContext";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { GroupStoreProvider } from "@lib/groups/useGroupStore";
import { type FormElement, type FormProperties } from "@lib/types";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { SaveButton } from "@formBuilder/components/shared/SaveButton";
import { TemplateValidationErrors } from "@formBuilder/[id]/edit/components/MigrationProblemsNotice";
import navigationFocus from "@root/__fixtures__/navigationFocus.json";
import { render } from "./testUtils";
import { setupFonts } from "../helpers/setupFonts";

import "@root/styles/app.css";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ status: "authenticated", data: { user: { id: "user-1" } } }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/form-builder/0000/edit",
  useRouter: () => ({ replace: vi.fn() }),
  useParams: () => ({ locale: "en" }),
}));

vi.mock("@formBuilder/actions", () => ({
  createOrUpdateTemplate: vi.fn(async ({ formConfig }: { formConfig: FormProperties }) => ({
    formRecord: null,
    error: "validationError",
    problems: validateTemplate(formConfig).problems.flatMap((problem) => [problem, { ...problem }]),
  })),
  updateTemplate: vi.fn(),
}));

const dropdown = (id: number, title: string): FormElement => ({
  id,
  type: "dropdown",
  properties: {
    titleEn: title,
    titleFr: title,
    validation: { required: false },
    choices: [
      { en: "A", fr: "A" },
      { en: "A", fr: "A" },
    ],
  },
});

const legacyForm = (): FormProperties => {
  const form = structuredClone(navigationFocus) as FormProperties;
  form.schemaVersion = 1;
  form.elements = [
    dropdown(901, "Top-level question"),
    {
      id: 902,
      type: "dynamicRow",
      properties: {
        titleEn: "Repeating set",
        titleFr: "Repeating set",
        validation: { required: false },
        subElements: [dropdown(903, "Nested question")],
      },
    },
  ];
  form.layout = [901, 902];
  Object.values(form.groups!).forEach((group) => {
    group.elements = [];
  });
  form.groups!.start.elements = ["901", "902"];
  return form;
};

const Editor = () => {
  const { importTemplate, updateField, form } = useTemplateStore((state) => ({
    importTemplate: state.importTemplate,
    updateField: state.updateField,
    form: state.form,
  }));
  return (
    <>
      <button onClick={() => importTemplate(legacyForm())}>Load legacy draft</button>
      <button onClick={() => updateField("form.elements[0].properties.choices[1].en", "B")}>
        Fix top-level duplicate
      </button>
      <button
        onClick={() =>
          updateField("form.elements[1].properties.subElements[0].properties.choices[1].en", "B")
        }
      >
        Fix nested duplicate
      </button>
      <output data-testid="schema-version">{form.schemaVersion}</output>
      <SaveButton />
      <TemplateValidationErrors />
    </>
  );
};

beforeAll(setupFonts);

it("deduplicates and focuses returned save errors, then clears them when the legacy draft is corrected", async () => {
  await render(
    <SaveTemplateProvider>
      <GroupStoreProvider>
        <Editor />
      </GroupStoreProvider>
    </SaveTemplateProvider>
  );
  await page.getByRole("button", { name: "Load legacy draft" }).click();
  await page.getByRole("button", { name: "Fix top-level duplicate" }).click();
  await expect.element(page.getByTestId("schema-version")).toHaveTextContent("1");
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();

  await new Promise((resolve) => window.setTimeout(resolve, 2100));
  await page.getByRole("button", { name: "Save draft" }).click();

  const summary = page.getByRole("alert");
  await expect.element(summary).toBeVisible();
  await expect.element(summary).toHaveFocus();
  await expect.element(page.getByText("1 validation error found", { exact: true })).toBeVisible();
  await expect
    .element(
      page.getByText("Your form was not saved. Fix these errors before saving or publishing.")
    )
    .toBeVisible();
  await expect.element(page.getByRole("link", { name: "Not saved - Fix errors" })).toBeVisible();
  await page.getByText("Show errors", { exact: true }).click();
  expect(summary.element().querySelectorAll("li")).toHaveLength(1);
  await expect.element(page.getByRole("button", { name: "Nested question" })).toBeVisible();
  await expect
    .element(page.getByText("Duplicate choices: A. Remove or change the repeated choices."))
    .toBeVisible();
  await expect.element(page.getByTestId("schema-version")).toHaveTextContent("1");

  await page.getByRole("button", { name: "Fix nested duplicate" }).click();
  await expect.element(summary).not.toBeInTheDocument();
  await expect
    .element(page.getByRole("link", { name: "Not saved - Fix errors" }))
    .not.toBeInTheDocument();
});

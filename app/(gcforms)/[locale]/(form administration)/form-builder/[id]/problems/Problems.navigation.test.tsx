/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Problems } from "./Problems";

const mock = vi.hoisted(() => ({
  language: "en",
  path: "elements[0].properties.choices",
  choiceId: "1.invalid",
}));

vi.mock("@lib/store/hooks/useTemplateMigrationProblems", () => ({
  useTemplateMigrationProblems: () => [
    { path: mock.path, name: "uniqueItems", message: "contains duplicate item", fromVersion: 1 },
  ],
}));

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (select: (state: unknown) => unknown) =>
    select({
      id: "draft-123",
      form: {
        elements: [
          {
            id: 7,
            properties: {
              titleEn: "Question",
              conditionalRules: [{ choiceId: mock.choiceId }],
              subElements: [{ id: 12, properties: { titleEn: "Nested question" } }],
            },
          },
          {
            id: 1,
            properties: {
              titleEn: "Source question",
              subElements: [{ id: 13, properties: { titleEn: "Nested source question" } }],
            },
          },
        ],
        groups: { start: { elements: ["1"] }, "page two": { elements: ["7"] } },
      },
    }),
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: mock.language } }),
}));

describe("Problems navigation", () => {
  afterEach(() => {
    cleanup();
    mock.language = "en";
    mock.path = "elements[0].properties.choices";
    mock.choiceId = "1.invalid";
  });

  it("links to the question on its containing page", () => {
    render(<Problems />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/form-builder/draft-123/edit?group=page%20two#element-7"
    );
  });

  it("links to a nested question using the containing top-level page", () => {
    mock.language = "fr";
    mock.path = "elements.0.properties.subElements.0.properties.choices";
    render(<Problems />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/fr/form-builder/draft-123/edit?group=page%20two#element-12"
    );
  });

  it.each([
    "elements[0].properties.conditionalRules[0].choiceId",
    "elements.0.properties.conditionalRules.0.choiceId",
  ])("links a choiceId problem to its source question for %s", (path) => {
    mock.path = path;
    render(<Problems />);
    expect(screen.getByText("Question", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/form-builder/draft-123/edit?group=start#element-1"
    );
  });

  it("finds the containing page of a nested source question", () => {
    mock.path = "elements[0].properties.conditionalRules[0].choiceId";
    mock.choiceId = "13.invalid";
    render(<Problems />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/form-builder/draft-123/edit?group=start#element-13"
    );
  });

  it.each(["99.invalid", "invalid", ""])(
    "keeps the affected question as the target when the source cannot be found: %s",
    (choiceId) => {
      mock.path = "elements[0].properties.conditionalRules[0].choiceId";
      mock.choiceId = choiceId;
      render(<Problems />);
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "/en/form-builder/draft-123/edit?group=page%20two#element-7"
      );
    }
  );

  it("does not redirect other conditional rule problems", () => {
    mock.path = "elements[0].properties.conditionalRules";
    render(<Problems />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/en/form-builder/draft-123/edit?group=page%20two#element-7"
    );
  });

  it.each(["titleEn", "elements[8].properties.choices"])(
    "links to the editor without a broken anchor for %s",
    (path) => {
      mock.path = path;
      render(<Problems />);
      expect(screen.getByRole("link")).toHaveAttribute("href", "/en/form-builder/draft-123/edit");
    }
  );
});

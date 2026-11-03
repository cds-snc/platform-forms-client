/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MigrationProblemsNotice } from "./MigrationProblemsNotice";

const mock = vi.hoisted(() => ({ count: 0, language: "en", setInputFeedback: vi.fn() }));

vi.mock("@lib/store/hooks/useTemplateMigrationProblems", () => ({
  useTemplateMigrationProblems: () =>
    [
      {
        path: "elements[0].properties.choices",
        name: "uniqueItems",
        message: "Duplicate choices",
        fromVersion: 1,
      },
      {
        path: "layout",
        name: "minItems",
        message: "Empty layout",
        fromVersion: 1,
      },
    ].slice(0, mock.count),
}));

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (select: (state: Record<string, unknown>) => unknown) =>
    select({
      form: {
        elements: [
          {
            id: 1,
            type: "dropdown",
            properties: {
              titleEn: "Province",
              titleFr: "Province en français",
              choices: [
                { en: "Ontario", fr: "Ontario" },
                { en: "Ontario", fr: "Ontario" },
              ],
            },
          },
        ],
      },
      translationLanguagePriority: "en",
      setInputFeedback: mock.setInputFeedback,
    }),
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    i18n: { language: mock.language },
    t: (key: string, options?: { count: number }) => {
      if (key === "migrationProblems.count")
        return `${options?.count} compatibility problem${options?.count === 1 ? "" : "s"} found`;
      if (key === "migrationProblems.notice") return "You can still publish it.";
      if (key === "migrationProblems.show") return "Show problems";
      if (key === "migrationProblems.hide") return "Hide problems";
      if (key === "migrationProblems.form") return "Form";
      if (key === "migrationProblems.edit") return "Edit form";
      return key;
    },
  }),
}));

describe("MigrationProblemsNotice", () => {
  afterEach(() => {
    cleanup();
    mock.count = 0;
    mock.language = "en";
  });

  it("only appears while the draft has migration problems", () => {
    const view = render(<MigrationProblemsNotice />);
    expect(screen.queryByText("Show problems")).toBeNull();

    mock.count = 2;
    view.rerender(<MigrationProblemsNotice />);
    expect(screen.getByText("2 compatibility problems found")).toBeInTheDocument();
    expect(screen.getByText("You can still publish it.")).toBeInTheDocument();
    expect(screen.getByText("Show problems")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Review problems" })).toBeNull();

    mock.count = 0;
    view.rerender(<MigrationProblemsNotice />);
    expect(screen.queryByText("Show problems")).toBeNull();
  });

  it("shows the problem list inline and updates the label when toggled", async () => {
    mock.count = 2;
    render(<MigrationProblemsNotice />);
    const summary = screen.getByText("Show problems");
    const details = summary.closest("details");
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("2 compatibility problems found")).toBeVisible();
    expect(screen.getByText("You can still publish it.")).toBeVisible();
    expect(screen.getByText("Province")).not.toBeVisible();

    fireEvent.click(summary);
    await waitFor(() => expect(screen.getByText("Hide problems")).toBeVisible());
    expect(screen.queryByText("Show problems")).toBeNull();
    expect(details).toHaveAttribute("open");
    expect(screen.getByText("Province")).toBeVisible();
    expect(screen.getByText("Form")).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("migrationProblems.duplicateChoices")).toBeVisible();
    screen.getAllByRole("link", { name: "Edit form" }).forEach((link) => {
      expect(link).toHaveAttribute("href", "#questions");
    });

    fireEvent.click(summary);
    await waitFor(() => expect(screen.getByText("Show problems")).toBeVisible());
    expect(screen.queryByText("Hide problems")).toBeNull();
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("Province")).not.toBeVisible();
  });

  it("uses the current language for question titles", () => {
    mock.count = 1;
    mock.language = "fr";
    render(<MigrationProblemsNotice />);
    fireEvent.click(screen.getByText("Show problems"));
    expect(screen.getByText("Province en français")).toBeVisible();
  });
});

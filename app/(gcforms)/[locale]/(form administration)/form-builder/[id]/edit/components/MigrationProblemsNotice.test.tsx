/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MigrationProblemsNotice, TemplateValidationErrors } from "./MigrationProblemsNotice";

const mock = vi.hoisted(() => ({
  count: 0,
  validationCount: 0,
  showValidationErrors: true,
  language: "en",
  path: "elements[0].properties.choices",
  richText: false,
  setTemplateProblemFeedback: vi.fn(),
  setId: vi.fn(),
  findParentGroup: vi.fn(() => ({ index: "page-2" })),
  focus: vi.fn(),
  scrollIntoView: vi.fn(),
}));

vi.mock("@lib/hooks/form-builder/useTemplateContext", () => ({
  useTemplateContext: () => ({ showValidationErrors: mock.showValidationErrors }),
}));

vi.mock("@lib/groups/useGroupStore", () => ({
  useGroupStore: (select: (state: Record<string, unknown>) => unknown) =>
    select({ setId: mock.setId, findParentGroup: mock.findParentGroup }),
}));

vi.mock("./RefsContext", () => ({
  useRefsContext: () => ({
    refs: {
      current: {
        1: { focus: mock.focus, scrollIntoView: mock.scrollIntoView },
        2: { focus: mock.focus, scrollIntoView: mock.scrollIntoView },
      },
    },
  }),
}));

vi.mock("@lib/store/hooks/useTemplateMigrationProblems", () => ({
  useTemplateMigrationProblems: () =>
    [
      {
        path: mock.path,
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

vi.mock("@lib/store/hooks/useTemplateValidationProblems", () => ({
  useTemplateValidationProblems: () =>
    [
      {
        path: mock.path,
        name: "uniqueItems",
        message: "Duplicate choices",
      },
    ].slice(0, mock.validationCount),
}));

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (select: (state: Record<string, unknown>) => unknown) =>
    select({
      id: "form-1",
      form: {
        elements: [
          {
            id: 1,
            type: mock.richText ? "richText" : "dropdown",
            properties: {
              titleEn: "Province",
              titleFr: "Province en français",
              subElements: [
                {
                  id: 2,
                  type: "dropdown",
                  properties: { titleEn: "Nested question", choices: [] },
                },
              ],
              choices: [
                { en: "Ontario", fr: "Ontario" },
                { en: "Ontario", fr: "Ontario" },
              ],
            },
          },
        ],
      },
      translationLanguagePriority: "en",
      setTemplateProblemFeedback: mock.setTemplateProblemFeedback,
    }),
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    i18n: { language: mock.language },
    t: (key: string) => {
      if (key === "migrationProblems.title") return "We continuously update GC Forms";
      if (key === "migrationProblems.notice") return "You can still save and publish it.";
      if (key === "migrationProblems.show") return "Show";
      if (key === "migrationProblems.hide") return "Hide";
      if (key === "validationProblems.title") return "Edit before saving or publishing";
      if (key === "validationProblems.notice") return "Adjust these form elements:";
      if (key === "validationProblems.show") return "Show";
      if (key === "validationProblems.hide") return "Hide";
      return key;
    },
  }),
}));

describe("MigrationProblemsNotice", () => {
  afterEach(() => {
    cleanup();
    mock.count = 0;
    mock.validationCount = 0;
    mock.showValidationErrors = true;
    mock.language = "en";
    mock.path = "elements[0].properties.choices";
    mock.richText = false;
    vi.clearAllMocks();
    mock.findParentGroup.mockReturnValue({ index: "page-2" });
  });

  it("keeps the summary hidden until saving is attempted, without hiding inline feedback", () => {
    mock.validationCount = 1;
    mock.showValidationErrors = false;
    const view = render(<TemplateValidationErrors />);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(mock.setTemplateProblemFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        "en:option--1--1": expect.objectContaining({ state: "error" }),
      })
    );

    mock.showValidationErrors = true;
    view.rerender(<TemplateValidationErrors />);
    expect(screen.getByRole("alert")).toBeVisible();
  });

  it("only appears while the draft has migration problems", () => {
    const view = render(<MigrationProblemsNotice />);
    expect(screen.queryByText("Show")).toBeNull();

    mock.count = 2;
    view.rerender(<MigrationProblemsNotice />);
    expect(screen.getByText("We continuously update GC Forms")).toBeInTheDocument();
    expect(screen.getByText("You can still save and publish it.")).toBeInTheDocument();
    expect(screen.getByText("Show")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Review problems" })).toBeNull();

    mock.count = 0;
    view.rerender(<MigrationProblemsNotice />);
    expect(screen.queryByText("Show")).toBeNull();
  });

  it("shows the problem list inline and updates the label when toggled", async () => {
    mock.count = 2;
    render(<MigrationProblemsNotice />);
    const summary = screen.getByText("Show");
    const details = summary.closest("details");
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("We continuously update GC Forms")).toBeVisible();
    expect(screen.getByText("You can still save and publish it.")).toBeVisible();
    expect(screen.getByText("Province")).not.toBeVisible();

    fireEvent.click(summary);
    await waitFor(() => expect(screen.getByText("Hide")).toBeVisible());
    expect(screen.queryByText("Show")).toBeNull();
    expect(details).toHaveAttribute("open");
    expect(screen.getByText("Province")).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("migrationProblems.duplicateChoices")).toBeVisible();
    expect(screen.getByRole("button", { name: "Province" })).toBeVisible();
    expect(screen.queryByRole("link")).toBeNull();

    fireEvent.click(summary);
    await waitFor(() => expect(screen.getByText("Show")).toBeVisible());
    expect(screen.queryByText("Hide")).toBeNull();
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("Province")).not.toBeVisible();
  });

  it("uses the current language for question titles", () => {
    mock.count = 1;
    mock.language = "fr";
    render(<MigrationProblemsNotice />);
    fireEvent.click(screen.getByText("Show"));
    expect(screen.getByText("Province en français")).toBeVisible();
  });

  it.each(["migration", "validation"])(
    "lists %s problems without an element target without a link or button",
    (variant) => {
      mock.path = "schemaVersion";
      if (variant === "migration") mock.count = 1;
      else mock.validationCount = 1;
      render(variant === "migration" ? <MigrationProblemsNotice /> : <TemplateValidationErrors />);
      fireEvent.click(screen.getByText("Show"));
      expect(screen.getAllByRole("listitem")).toHaveLength(1);
      expect(screen.queryByRole("link")).toBeNull();
      expect(screen.queryByRole("button", { name: "Province" })).toBeNull();
      expect(mock.setId).not.toHaveBeenCalled();
    }
  );

  it("switches to the element's page before focusing and scrolling to it", () => {
    mock.count = 1;
    render(<MigrationProblemsNotice />);
    fireEvent.click(screen.getByText("Show"));
    fireEvent.click(screen.getByRole("button", { name: "Province" }));
    expect(mock.findParentGroup).toHaveBeenCalledWith("1");
    expect(mock.setId).toHaveBeenCalledWith("page-2");
    expect(mock.focus).toHaveBeenCalledOnce();
    expect(mock.setId.mock.invocationCallOrder[0]).toBeLessThan(
      mock.focus.mock.invocationCallOrder[0]
    );
    expect(mock.scrollIntoView).toHaveBeenCalledWith({ block: "center" });
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("uses the containing element's page for a repeating-set question", () => {
    mock.count = 1;
    mock.path = "elements[0].properties.subElements[0].properties.choices";
    render(<MigrationProblemsNotice />);
    fireEvent.click(screen.getByText("Show"));
    fireEvent.click(screen.getByRole("button", { name: "Nested question" }));
    expect(mock.findParentGroup).toHaveBeenCalledWith("1");
    expect(mock.setId).toHaveBeenCalledWith("page-2");
    expect(mock.focus).toHaveBeenCalledOnce();
  });

  it("focuses the rich text editor when the problem refers to a text element", () => {
    mock.count = 1;
    mock.richText = true;
    render(
      <>
        <MigrationProblemsNotice />
        <div id="element-1">
          <textarea id="editor-1" />
        </div>
      </>
    );
    const panel = document.getElementById("element-1")!;
    panel.scrollIntoView = mock.scrollIntoView;
    fireEvent.click(screen.getByText("Show"));
    fireEvent.click(screen.getByRole("button", { name: "Province" }));
    expect(document.getElementById("editor-1")).toHaveFocus();
    expect(mock.focus).not.toHaveBeenCalled();
    expect(mock.scrollIntoView).toHaveBeenCalledWith({ block: "center" });
  });

  it("uses the compatibility summary styling with blocking language and expandable errors", async () => {
    mock.validationCount = 1;
    const view = render(<TemplateValidationErrors />);
    const summary = screen.getByRole("alert");
    expect(summary).toHaveClass("rounded-lg", "border-amber-300", "bg-amber-50");
    expect(summary).not.toHaveClass("gc-alert");
    expect(summary).toHaveAttribute("tabindex", "-1");
    expect(screen.getByText("Edit before saving or publishing")).toBeVisible();
    expect(screen.getByText("Adjust these form elements:")).toBeVisible();
    expect(screen.queryByText("You can still save and publish it.")).toBeNull();
    const details = screen.getByText("Show").closest("details");
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("Province")).not.toBeVisible();
    fireEvent.click(screen.getByText("Show"));
    await waitFor(() => expect(screen.getByText("Hide")).toBeVisible());
    expect(details).toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: "Province" }));
    expect(mock.setId).toHaveBeenCalledWith("page-2");
    expect(mock.focus).toHaveBeenCalledOnce();
    expect(mock.setTemplateProblemFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        "en:option--1--1": expect.objectContaining({ state: "error" }),
      })
    );

    mock.validationCount = 0;
    view.rerender(<TemplateValidationErrors />);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(mock.setTemplateProblemFeedback).toHaveBeenCalledWith({});
  });

  it("always navigates to questions within the editor", () => {
    mock.validationCount = 1;
    render(<TemplateValidationErrors />);
    fireEvent.click(screen.getByText("Show"));
    fireEvent.click(screen.getByRole("button", { name: "Province" }));
    expect(mock.setId).toHaveBeenCalledWith("page-2");
    expect(mock.focus).toHaveBeenCalledOnce();
    expect(screen.queryByRole("link", { name: "Province" })).toBeNull();
  });
});

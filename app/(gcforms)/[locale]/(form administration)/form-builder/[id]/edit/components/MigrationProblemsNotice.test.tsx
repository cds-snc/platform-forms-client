/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MigrationProblemsNotice } from "./MigrationProblemsNotice";

const mock = vi.hoisted(() => ({ count: 0, id: "draft-123", setInputFeedback: vi.fn() }));

vi.mock("@lib/store/hooks/useTemplateMigrationProblems", () => ({
  useTemplateMigrationProblems: () => Array.from({ length: mock.count }, () => ({})),
}));

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (select: (state: Record<string, unknown>) => unknown) =>
    select({
      id: mock.id,
      form: { elements: [] },
      translationLanguagePriority: "en",
      setInputFeedback: mock.setInputFeedback,
    }),
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count: number }) => {
      if (key === "migrationProblems.count")
        return `${options?.count} compatibility problem${options?.count === 1 ? "" : "s"} found`;
      if (key === "migrationProblems.notice") return "You can still publish it.";
      if (key === "migrationProblems.review") return "Review problems";
      return key;
    },
  }),
}));

describe("MigrationProblemsNotice", () => {
  afterEach(() => {
    cleanup();
    mock.count = 0;
  });

  it("only appears for a draft with migration problems and links to the current form", () => {
    const view = render(<MigrationProblemsNotice id="0000" locale="en" />);
    expect(screen.queryByText("Review problems")).toBeNull();

    mock.count = 2;
    view.rerender(<MigrationProblemsNotice id="0000" locale="en" />);
    expect(screen.getByText("2 compatibility problems found")).toBeInTheDocument();
    expect(screen.getByText("You can still publish it.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review problems" })).toHaveAttribute(
      "href",
      "/en/form-builder/draft-123/problems"
    );

    mock.count = 0;
    view.rerender(<MigrationProblemsNotice id="0000" locale="en" />);
    expect(screen.queryByText("Review problems")).toBeNull();
  });
});

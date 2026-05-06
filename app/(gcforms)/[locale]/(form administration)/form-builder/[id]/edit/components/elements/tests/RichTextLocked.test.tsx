/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { RichTextLocked } from "../RichTextLocked";

// Mock child components
vi.mock("../RichTextEditor", () => ({
  RichTextEditor: () => <div data-testid="rich-text-editor">Rich Text Editor</div>,
}));

vi.mock("../element-dialog/AddElementButton", () => ({
  AddElementButton: () => <div>Add Element</div>,
}));

vi.mock("@formBuilder/components/shared/EssentialBadge", () => ({
  EssentialBadge: () => <label data-testid="locked-item">Essential Badge</label>,
}));

vi.mock("@lib/hooks/form-builder/useHandleAdd", () => ({
  useHandleAdd: () => ({
    handleAddElement: vi.fn(),
  }),
}));

vi.mock("react-loading-skeleton", () => ({
  default: () => <div>Skeleton</div>,
}));

// Mock the store hook
vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      localizeField: (field: string) => field + "En",
      form: {
        introduction: {
          descriptionEn: "Test introduction",
        },
      },
      translationLanguagePriority: "en",
    }),
}));

describe("RichTextLocked", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("renders rich text editor in a locked panel", () => {
    const { container } = render(
      <RichTextLocked
        id="test-id"
        summaryText="Test Summary"
        schemaProperty="introduction"
        addElement={false}
        hydrated={true}
      />
    );

    // Just verify the component renders without errors
    expect(container.firstChild).toBeTruthy();
  });
});

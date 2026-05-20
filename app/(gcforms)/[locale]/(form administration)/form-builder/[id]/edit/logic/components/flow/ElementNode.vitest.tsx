/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@xyflow/react", () => ({
  Handle: ({ isConnectable: _isConnectable, ...props }: Record<string, unknown>) => (
    <div data-testid="flow-handle" {...props} />
  ),
  Position: {
    Right: "right",
  },
}));

import { ElementNode } from "./ElementNode";
import { FormElementTypes } from "@lib/types";

const renderElementNode = (hasRules: boolean) => {
  return render(
    <ElementNode
      data={{
        groupId: "page-1",
        elementId: 1,
        hasRules,
      }}
      id="page-1::element::1"
      type="elementNode"
      selected={false}
      zIndex={0}
      selectable={true}
      deletable={false}
      draggable={false}
      isConnectable
      dragging={false}
      width={0}
      height={0}
      positionAbsoluteX={0}
      positionAbsoluteY={0}
    />
  );
};

const mockTogglePanel = vi.fn();
const mockSetId = vi.fn();
const mockSetSelectedElementId = vi.fn();

const branchableElement = {
  id: 1,
  type: FormElementTypes.radio,
  properties: {
    choices: [
      { en: "One", fr: "Un" },
      { en: "Two", fr: "Deux" },
    ],
  },
};

vi.mock("@lib/groups/useGroupStore", () => ({
  useGroupStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      getElement: () => branchableElement,
      setId: mockSetId,
      setSelectedElementId: mockSetSelectedElementId,
      selectedElementId: undefined,
      id: undefined,
    }),
}));

vi.mock("@lib/hooks/useElementTitle", () => ({
  useElementTitle: () => ({
    getTitle: () => "Question title",
  }),
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string>) => {
      if (key === "groups.editRules") {
        return `Edit branching for page ${values?.name ?? ""}`;
      }

      if (key === "groups.addBranch") {
        return "Add branch";
      }

      return key;
    },
  }),
}));

vi.mock(
  "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider",
  () => ({
    useTreeRef: () => ({ togglePanel: mockTogglePanel }),
  })
);

describe("ElementNode", () => {
  it("shows a plus icon when a branchable element has no rules yet", () => {
    const { container } = renderElementNode(false);

    expect(container.querySelector("button")).toBeInTheDocument();
    expect(container).toHaveTextContent("Question title");
    expect(container.querySelector("title")?.textContent).toBe("Add branch");
    expect(screen.queryByTestId("flow-handle")).not.toBeInTheDocument();
  });

  it("shows the existing green arrow icon when rules already exist", () => {
    const { container } = renderElementNode(true);

    expect(container.querySelector("button")).toBeInTheDocument();
    expect(container).toHaveTextContent("Question title");
    expect(container.querySelector("title")?.textContent).toBe(
      "Edit branching for page Question title"
    );
    expect(screen.getByTestId("flow-handle")).toBeInTheDocument();
  });
});

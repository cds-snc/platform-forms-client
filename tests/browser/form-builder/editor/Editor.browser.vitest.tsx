import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Editor } from "@root/packages/editor/src";

function getEditor() {
  return screen.getByLabelText("AriaLabel");
}

describe("<RichTextEditor />", () => {
  it("Adds and styles text", async () => {
    render(
      <div className="form-builder">
        <Editor content="" ariaLabel="AriaLabel" locale="en" />
      </div>
    );

    const editor = getEditor();

    // Type text into the editor
    await userEvent.type(
      editor,
      [
        "H2 heading text{enter}",
        "H3 heading text{enter}",
        "Let's bold part of this sentence.{enter}",
        "Let's italicize part of this sentence.{enter}",
        "Part of his one will be a link{enter}",
      ].join("")
    );

    // Helper to find a text node containing the given text
    function findTextNode(node: Node, text: string): { node: Text; start: number } | null {
      if (node.nodeType === Node.TEXT_NODE) {
        const idx = node.textContent?.indexOf(text) ?? -1;
        if (idx !== -1) return { node: node as Text, start: idx };
      }
      for (const child of node.childNodes) {
        const found = findTextNode(child, text);
        if (found) return found;
      }
      return null;
    }

    // Helper to select text in the editor
    function selectText(text: string) {
      const found = findTextNode(editor, text);
      if (!found) throw new Error(`Text "${text}" not found`);
      const range = document.createRange();
      range.setStart(found.node, found.start);
      range.setEnd(found.node, found.start + text.length);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }

    // H2 heading
    selectText("H2 heading text");
    await userEvent.click(screen.getByTestId("h2-button"));
    expect(within(editor).getByText("H2 heading text").parentElement?.tagName).toBe("H2");
    expect(screen.getByTestId("h2-button")).toHaveAttribute("aria-pressed", "true");

    // H3 heading
    selectText("H3 heading text");
    await userEvent.click(screen.getByTestId("h3-button"));
    expect(within(editor).getByText("H3 heading text").parentElement?.tagName).toBe("H3");
    expect(screen.getByTestId("h3-button")).toHaveAttribute("aria-pressed", "true");

    // Bold
    selectText("bold part of this");
    await userEvent.click(screen.getByTestId("bold-button"));
    expect(within(editor).getByText("bold part of this").tagName).toBe("STRONG");
    expect(screen.getByTestId("bold-button")).toHaveAttribute("aria-pressed", "true");

    // Italic
    selectText("italicize part of this");
    await userEvent.click(screen.getByTestId("italic-button"));
    expect(within(editor).getByText("italicize part of this").tagName).toBe("EM");
    expect(screen.getByTestId("italic-button")).toHaveAttribute("aria-pressed", "true");

    // Bullet list
    await userEvent.type(editor, "This is a bullet list item");
    await userEvent.click(screen.getByTestId("bullet-list-button"));
    expect(within(editor).getByText("This is a bullet list item").closest("ul")).not.toBeNull();
    expect(screen.getByTestId("bullet-list-button")).toHaveAttribute("aria-pressed", "true");

    // Numbered list
    await userEvent.type(editor, "{enter}{enter}This is a numbered list item");
    await userEvent.click(screen.getByTestId("numbered-list-button"));
    expect(within(editor).getByText("This is a numbered list item").closest("ol")).not.toBeNull();
    expect(screen.getByTestId("numbered-list-button")).toHaveAttribute("aria-pressed", "true");

    // Link
    selectText("will be a link");
    await userEvent.click(screen.getByTestId("link-button"));
    const linkInput = screen.getByTestId("gc-link-editor").querySelector("input");
    if (linkInput) {
      await userEvent.clear(linkInput);
      await userEvent.type(linkInput, "https://example.com");
      await userEvent.keyboard("{Enter}{Escape}");
    }
    const link = within(editor).getByText("will be a link").closest("a");
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("href", "https://example.com");

    // Indent/Outdent (simulate as best as possible)
    await userEvent.type(editor, "{enter}{enter}This is a numbered list item 2");
    await userEvent.click(screen.getByTestId("numbered-list-button"));
    await userEvent.type(editor, "{enter}This is another numbered list item 2");
    await userEvent.click(screen.getByTestId("indent-button"));
    await userEvent.click(screen.getByTestId("outdent-button"));
    // Check that the items exist (structure checks may need to be more robust)
    expect(within(editor).getByText("This is a numbered list item 2")).toBeInTheDocument();
    expect(within(editor).getByText("This is another numbered list item 2")).toBeInTheDocument();
  });
});

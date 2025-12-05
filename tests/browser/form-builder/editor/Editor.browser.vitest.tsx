import { describe, it, expect, beforeAll } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { Editor } from "@gcforms/editor";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";

describe("<RichTextEditor />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("Adds and styles text", async () => {
    await render(
      <div className="form-builder">
        <Editor content="" ariaLabel="AriaLabel" locale="en" />
      </div>
    );

    // Add some strings to get formatted
    const editor = document.querySelector('[id^="editor-"]') as HTMLElement;
    expect(editor).toBeTruthy();
    
    await userEvent.click(editor);
    await userEvent.keyboard(`
    H2 heading text
    H3 heading text
    Let's bold part of this sentence.
    Let's italicize part of this sentence.
    Part of his one will be a link    
    `);

    // Add H2 heading
    // Select "H2 heading text"
    const range = document.createRange();
    const selection = window.getSelection();
    const h2TextNode = Array.from(editor.childNodes).find(
      (node) => node.textContent?.includes("H2 heading text")
    );
    if (h2TextNode && h2TextNode.firstChild) {
      const text = h2TextNode.textContent || "";
      const startIndex = text.indexOf("H2 heading text");
      range.setStart(h2TextNode.firstChild, startIndex);
      range.setEnd(h2TextNode.firstChild, startIndex + "H2 heading text".length);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    const h2Button = page.getByTestId("h2-button");
    await h2Button.click();
    
    const h2Element = document.querySelector('[id^="editor-"] h2');
    expect(h2Element?.textContent).toContain("H2 heading text");
    await expect.element(h2Button).toHaveAttribute("aria-pressed", "true");

    // Add H3 heading
    const h3TextNode = Array.from(editor.childNodes).find(
      (node) => node.textContent?.includes("H3 heading text")
    );
    if (h3TextNode?.firstChild) {
      const text = h3TextNode.textContent || "";
      const startIndex = text.indexOf("H3 heading text");
      range.setStart(h3TextNode.firstChild, startIndex);
      range.setEnd(h3TextNode.firstChild, startIndex + "H3 heading text".length);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    const h3Button = page.getByTestId("h3-button");
    await h3Button.click();
    
    const h3Element = document.querySelector('[id^="editor-"] h3');
    expect(h3Element?.textContent).toContain("H3 heading text");
    await expect.element(h3Button).toHaveAttribute("aria-pressed", "true");

    // Bold part of the text
    const boldTextNode = Array.from(editor.querySelectorAll("*")).find(
      (node) => node.textContent?.includes("bold part of this")
    );
    if (boldTextNode?.firstChild) {
      const text = boldTextNode.textContent || "";
      const startIndex = text.indexOf("bold part of this");
      range.setStart(boldTextNode.firstChild, startIndex);
      range.setEnd(boldTextNode.firstChild, startIndex + "bold part of this".length);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    const boldButton = page.getByTestId("bold-button");
    await boldButton.click();
    
    const strongElement = document.querySelector('[id^="editor-"] strong');
    expect(strongElement?.textContent).toContain("bold part of this");
    await expect.element(boldButton).toHaveAttribute("aria-pressed", "true");

    // Italicize part of the text
    const italicTextNode = Array.from(editor.querySelectorAll("*")).find(
      (node) => node.textContent?.includes("italicize part of this")
    );
    if (italicTextNode?.firstChild) {
      const text = italicTextNode.textContent || "";
      const startIndex = text.indexOf("italicize part of this");
      range.setStart(italicTextNode.firstChild, startIndex);
      range.setEnd(italicTextNode.firstChild, startIndex + "italicize part of this".length);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    const italicButton = page.getByTestId("italic-button");
    await italicButton.click();
    
    const emElement = document.querySelector('[id^="editor-"] em');
    expect(emElement?.textContent).toContain("italicize part of this");
    await expect.element(italicButton).toHaveAttribute("aria-pressed", "true");

    // Add a bullet list
    await userEvent.click(editor);
    editor.focus();
    
    // Move cursor to end
    const editorRange = document.createRange();
    editorRange.selectNodeContents(editor);
    editorRange.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(editorRange);
    
    await userEvent.keyboard("This is a bullet list item");
    
    const bulletListButton = page.getByTestId("bullet-list-button");
    await bulletListButton.click();
    
    await userEvent.keyboard("{Enter}This is another bullet list item");
    
    await expect.element(bulletListButton).toHaveAttribute("aria-pressed", "true");
    
    const bulletItems = document.querySelectorAll('[id^="editor-"] ul li');
    expect(bulletItems[0]?.textContent).toContain("This is a bullet list item");
    expect(bulletItems[bulletItems.length - 1]?.textContent).toContain("This is another bullet list item");

    // Add a numbered list - two enters are needed to escape the previous list
    await userEvent.keyboard("{Enter}{Enter}This is a numbered list item");
    
    const numberedListButton = page.getByTestId("numbered-list-button");
    await numberedListButton.click();
    
    await expect.element(numberedListButton).toHaveAttribute("aria-pressed", "true");
    
    await userEvent.keyboard("{Enter}This is another numbered list item");
    
    await expect.element(numberedListButton).toHaveAttribute("aria-pressed", "true");
    
    const numberedItems = document.querySelectorAll('[id^="editor-"] ol li');
    expect(numberedItems[0]?.textContent).toContain("This is a numbered list item");
    expect(numberedItems[numberedItems.length - 1]?.textContent).toContain("This is another numbered list item");

    // Add a link
    const linkTextNodes = Array.from(editor.querySelectorAll("*"));
    const linkTextNode = linkTextNodes.find(
      (node) => node.textContent?.includes("will be a link")
    );
    if (linkTextNode?.firstChild) {
      const text = linkTextNode.textContent || "";
      const startIndex = text.indexOf("will be a link");
      range.setStart(linkTextNode.firstChild, startIndex);
      range.setEnd(linkTextNode.firstChild, startIndex + "will be a link".length);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    const linkButton = page.getByTestId("link-button");
    await linkButton.click();
    
    const linkInput = page.getByTestId("gc-link-editor").getByRole("textbox");
    await linkInput.fill("https://example.com");
    await userEvent.keyboard("{Enter}{Escape}");
    
    const linkElement = document.querySelector('[id^="editor-"] a');
    expect(linkElement?.textContent).toContain("will be a link");
    expect(linkElement?.getAttribute("href")).toBe("https://example.com");

    // Add a new numbered list to test the indent and outdent buttons
    await userEvent.keyboard("{Enter}{Enter}{Enter}This is a numbered list item 2");
    
    await numberedListButton.click();
    
    await userEvent.keyboard("{Enter}This is another numbered list item 2");
    
    const numberedItems2 = document.querySelectorAll('[id^="editor-"] ol li');
    expect(numberedItems2[numberedItems2.length - 1]?.textContent).toContain("This is another numbered list item 2");
    
    // Indent the last list item
    const indentButton = page.getByTestId("indent-button");
    await indentButton.click();
    
    const numberedItemsAfterIndent = document.querySelectorAll('[id^="editor-"] ol li');
    expect(numberedItemsAfterIndent[2]?.textContent).toContain("This is a numbered list item 2");
    
    const nestedListItem = document.querySelector('[id^="editor-"] ol li ol li');
    expect(nestedListItem?.textContent).toContain("This is another numbered list item 2");
    
    // Outdent the last list item (revert)
    const outdentButton = page.getByTestId("outdent-button");
    await outdentButton.click();
    
    const numberedItemsAfterOutdent = document.querySelectorAll('[id^="editor-"] ol li');
    expect(numberedItemsAfterOutdent[2]?.textContent).toContain("This is a numbered list item 2");
    expect(numberedItemsAfterOutdent[numberedItemsAfterOutdent.length - 1]?.textContent).toContain("This is another numbered list item 2");
  });
});

/**
 * @vitest-environment jsdom
 */
import React from "react";
import { cleanup, screen, render, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { $getRoot } from "lexical";
// import { defaultStore as store, Providers } from "@lib/utils/form-builder/test-utils";
// import { RichTextEditor } from "../RichTextEditor";
import { Editor } from "../Editor";

const promise = Promise.resolve();

describe("Lexical Editor", () => {
  afterEach(() => {
    cleanup();
  });

  it("Renders the Lexical Editor", async () => {
    //
    const rendered = render(
      <Editor
        ariaLabel="AriaLabel"
        ariaDescribedBy="AriaDescribedBy"
        id="editor-test"
        content="Here is some test content"
      />
    );

    await act(async () => {
      await promise;
    });

    const contentArea = rendered.container.querySelector('[id^="editor-"]');
    const toolbar = screen.getByTestId("toolbar");
    const [h2, h3, bold, italic, bulletList, numberedList, link, indent, outdent] =
      within(toolbar).getAllByRole("button");

    const toolbarButtons = within(toolbar).getAllByRole("button");

    expect(h2).toHaveAttribute("tabindex", "0");
    expect(h3).toHaveAttribute("tabindex", "-1");
    expect(bold).toHaveAttribute("tabindex", "-1");
    expect(italic).toHaveAttribute("tabindex", "-1");
    expect(bulletList).toHaveAttribute("tabindex", "-1");
    expect(numberedList).toHaveAttribute("tabindex", "-1");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(indent).toHaveAttribute("tabindex", "-1");
    expect(outdent).toHaveAttribute("tabindex", "-1");

    // Toolbar has aria-controls attribute
    expect(toolbar).toHaveAttribute("aria-controls", contentArea.id);

    // Details component is enabled by default.
    expect(toolbarButtons).toHaveLength(10);
    expect(within(toolbar).getByTestId("collapsible-button")).toBeInTheDocument();

    // Content area has default content and attributes
    expect(contentArea).toHaveAttribute("aria-label", "AriaLabel");
    expect(contentArea).toContainHTML("Here is some test content");
    expect(contentArea).toHaveAttribute("contenteditable", "true");
    expect(contentArea).toHaveAttribute("role", "textbox");
    expect(contentArea).toHaveAttribute("spellcheck", "true");
    expect(contentArea).toHaveAttribute("data-lexical-editor", "true");
  });

  it("can insert collapsible content from the toolbar", async () => {
    const onChange = vi.fn();
    const rendered = render(
      <Editor id="editor-test" content="Here is some content" onChange={onChange} />
    );

    await act(async () => {
      await promise;
    });

    await userEvent.click(screen.getByTestId("collapsible-button"));

    expect(rendered.container.querySelector(".Collapsible__container")).toBeInTheDocument();
    expect(rendered.container.querySelector(".Collapsible__title")).toBeInTheDocument();
    expect(rendered.container.querySelector(".Collapsible__content")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining(":::collapsible"));
  });

  it("renders collapsible Markdown blocks", async () => {
    const rendered = render(
      <Editor
        content={":::collapsible summary test\nDetails body\n:::"}
        ariaLabel="AriaLabel"
        enableCollapsibleBlocks
      />
    );

    await act(async () => {
      await promise;
    });

    expect(rendered.container.querySelector(".Collapsible__container")).toBeInTheDocument();
    expect(rendered.container.querySelector(".Collapsible__title")).toHaveTextContent(
      "summary test"
    );
    expect(rendered.container.querySelector(".Collapsible__content")).toHaveTextContent(
      "Details body"
    );
  });

  it("preserves heading markup when formatting collapsible content", async () => {
    const onChange = vi.fn();
    const rendered = render(
      <Editor
        content={":::collapsible Privacy\nPersonal information\n:::"}
        ariaLabel="AriaLabel"
        onChange={onChange}
      />
    );

    await act(async () => {
      await promise;
    });

    const contentArea = rendered.container.querySelector('[contenteditable="true"]');
    expect(contentArea).toBeInTheDocument();
    contentArea?.__lexicalEditor.update(() => {
      $getRoot().getFirstChild()?.getLastChild()?.getFirstChild()?.selectEnd();
    });

    await userEvent.click(screen.getByTestId("h2-button"));

    expect(rendered.container.querySelector(".Collapsible__content h2")).toHaveTextContent(
      "Personal information"
    );
    expect(onChange).toHaveBeenLastCalledWith(
      ":::collapsible Privacy\n## Personal information\n:::"
    );
  });

  it("preserves unordered and ordered list markup when formatting collapsible content", async () => {
    const onChange = vi.fn();
    const rendered = render(
      <Editor
        content={
          ":::collapsible Privacy\n- First item\n- Second item\n\n1. Third item\n2. Fourth item\n:::"
        }
        ariaLabel="AriaLabel"
        onChange={onChange}
      />
    );

    await act(async () => {
      await promise;
    });

    const contentArea = rendered.container.querySelector('[contenteditable="true"]');
    expect(contentArea?.querySelector(".Collapsible__content ul")).toBeInTheDocument();
    expect(contentArea?.querySelector(".Collapsible__content ol")).toBeInTheDocument();
    contentArea?.__lexicalEditor.update(() => {
      $getRoot()
        .getFirstChild()
        ?.getLastChild()
        ?.getFirstChild()
        ?.getFirstChild()
        ?.getFirstChild()
        ?.selectEnd();
    });

    await userEvent.click(screen.getByTestId("bold-button"));

    expect(onChange).toHaveBeenLastCalledWith(
      ":::collapsible Privacy\n- First item\n- Second item\n\n1. Third item\n2. Fourth item\n:::"
    );
  });

  it("preserves list nesting when indenting and outdenting collapsible content", async () => {
    const onChange = vi.fn();
    const rendered = render(
      <Editor
        content={":::collapsible Privacy\n- First item\n- Second item\n:::"}
        ariaLabel="AriaLabel"
        onChange={onChange}
      />
    );

    await act(async () => {
      await promise;
    });

    const contentArea = rendered.container.querySelector('[contenteditable="true"]');
    contentArea?.__lexicalEditor.update(() => {
      const list = $getRoot().getFirstChild()?.getLastChild()?.getFirstChild();
      const secondListItem = list?.getChildren()[1];
      secondListItem?.getFirstChild()?.selectEnd();
    });

    await userEvent.click(screen.getByTestId("indent-button"));

    expect(onChange).toHaveBeenLastCalledWith(
      ":::collapsible Privacy\n- First item\n    - Second item\n:::"
    );

    await userEvent.click(screen.getByTestId("outdent-button"));

    expect(onChange).toHaveBeenLastCalledWith(
      ":::collapsible Privacy\n- First item\n- Second item\n:::"
    );
  });

  it("can keyboard navigate the RichTextEditor", async () => {
    render(
      <div>
        <Editor
          ariaLabel="AriaLabel"
          ariaDescribedBy="AriaDescribedBy"
          content="Here is some test content"
        />
      </div>
    );

    await act(async () => {
      await promise;
    });

    const toolbar = screen.getByTestId("toolbar");

    const [h2, h3, bold, italic, bulletList, numberedList, link] =
      within(toolbar).getAllByRole("button");

    // expect(document.body).toHaveFocus();

    // tab into toolbar
    await userEvent.tab();
    expect(h2).toHaveFocus();

    // tab back out of toolbar
    await userEvent.tab({ shift: true });
    expect(document.body).toHaveFocus();

    // tab back into toolbar
    await userEvent.tab();
    await userEvent.keyboard("{arrowright}");
    expect(h3).toHaveFocus();

    await userEvent.keyboard("{arrowright}");
    expect(bold).toHaveFocus();

    await userEvent.keyboard("{arrowright}");
    expect(italic).toHaveFocus();

    await userEvent.keyboard("{arrowright}");
    expect(bulletList).toHaveFocus();

    await userEvent.keyboard("{arrowright}");
    expect(numberedList).toHaveFocus();

    await userEvent.keyboard("{arrowright}");
    expect(link).toHaveFocus();

    await userEvent.keyboard("{arrowleft}");
    expect(numberedList).toHaveFocus();

    // tab back out of toolbar
    await userEvent.tab({ shift: true });
    expect(document.body).toHaveFocus();

    // tab back into toolbar
    await userEvent.tab();
    expect(numberedList).toHaveFocus();
  });
});

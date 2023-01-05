import React from "react";
import { cleanup, screen, render, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";
import { RichTextEditor } from "../RichTextEditor";

const promise = Promise.resolve();

describe("RichTextEditor", () => {
  afterEach(() => {
    cleanup();
  });

  it("Renders the RichTextEditor", async () => {
    //
    const rendered = render(
      <Providers form={store.form}>
        <RichTextEditor
          path="path.to.content"
          content="Here is some test content"
          autoFocusEditor={true}
          ariaLabel="AriaLabel"
        />
      </Providers>
    );

    // rendered.debug();

    await act(async () => {
      await promise;
    });

    const contentArea = rendered.container.querySelector('[id^="editor-"]');
    const toolbar = screen.getByTestId("toolbar");
    const [h2, h3, bold, italic, bulletList, numberedList, link] =
      within(toolbar).getAllByRole("button");

    const toolbarButtons = within(toolbar).getAllByRole("button");

    expect(h2).toHaveAttribute("tabindex", "0");
    expect(h3).toHaveAttribute("tabindex", "-1");
    expect(bold).toHaveAttribute("tabindex", "-1");
    expect(italic).toHaveAttribute("tabindex", "-1");
    expect(bulletList).toHaveAttribute("tabindex", "-1");
    expect(numberedList).toHaveAttribute("tabindex", "-1");
    expect(link).toHaveAttribute("tabindex", "-1");

    // Toolbar has aria-controls attribute
    expect(toolbar).toHaveAttribute("aria-controls", contentArea.id);

    // Toolbar contains 7 formatting buttons
    expect(toolbarButtons).toHaveLength(7);

    // Content area has default content and attributes
    expect(contentArea).toHaveAttribute("aria-label", "AriaLabel");
    expect(contentArea).toContainHTML("Here is some test content");
    expect(contentArea).toHaveAttribute("contenteditable", "true");
    expect(contentArea).toHaveAttribute("role", "textbox");
    expect(contentArea).toHaveAttribute("spellcheck", "true");
    expect(contentArea).toHaveAttribute("data-lexical-editor", "true");
  });

  it("Sets and unsets aria-pressed state on Toolbar buttons", async () => {
    render(
      <Providers form={store.form}>
        <RichTextEditor
          path="path.to.content"
          content="Here is some test content"
          autoFocusEditor={true}
          ariaLabel="AriaLabel"
        />
      </Providers>
    );

    // rendered.debug();

    await act(async () => {
      await promise;
    });

    const user = userEvent.setup();

    const toolbar = screen.getByTestId("toolbar");
    const [h2, h3, bold, italic, bulletList, numberedList, link] =
      within(toolbar).getAllByRole("button");

    expect(h2).toHaveAttribute("aria-pressed", "false");
    expect(h3).toHaveAttribute("aria-pressed", "false");
    expect(bold).toHaveAttribute("aria-pressed", "false");
    expect(italic).toHaveAttribute("aria-pressed", "false");
    expect(bulletList).toHaveAttribute("aria-pressed", "false");
    expect(numberedList).toHaveAttribute("aria-pressed", "false");
    expect(link).toHaveAttribute("aria-pressed", "false");

    await user.click(h2);
    expect(h2).toHaveAttribute("aria-pressed", "true");
    await user.click(h2);
    expect(h2).toHaveAttribute("aria-pressed", "false");

    await user.click(h3);
    expect(h3).toHaveAttribute("aria-pressed", "true");
    await user.click(h3);
    expect(h3).toHaveAttribute("aria-pressed", "false");

    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "true");
    await user.click(bold);
    expect(bold).toHaveAttribute("aria-pressed", "false");

    await user.click(italic);
    expect(italic).toHaveAttribute("aria-pressed", "true");
    await user.click(italic);
    expect(italic).toHaveAttribute("aria-pressed", "false");

    await user.click(bulletList);
    expect(bulletList).toHaveAttribute("aria-pressed", "true");
    await user.click(bulletList);
    expect(bulletList).toHaveAttribute("aria-pressed", "false");

    await user.click(numberedList);
    expect(numberedList).toHaveAttribute("aria-pressed", "true");
    await user.click(numberedList);
    expect(numberedList).toHaveAttribute("aria-pressed", "false");

    await user.click(link);
    expect(link).toHaveAttribute("aria-pressed", "true");
    await user.click(link);
    expect(link).toHaveAttribute("aria-pressed", "false");
  });

  it("Can create links", async () => {
    const rendered = render(
      <Providers form={store.form}>
        <RichTextEditor
          path="path.to.content"
          content="Here is some test content"
          autoFocusEditor={true}
          ariaLabel="AriaLabel"
        />
      </Providers>
    );

    // rendered.debug();

    await act(async () => {
      await promise;
    });

    const user = userEvent.setup();
    const contentArea = rendered.container.querySelector('[id^="editor-"]');
    const linkButton = screen.getByTestId("link-button");
    await user.click(linkButton);

    // rendered.debug();

    // Doesn't work - trying to find the link editor
    // await screen.findByTestId("link-editor");
    // expect(linkEditor).toHaveClass("link-editor");

    // The string is wrapped with a link
    const link = contentArea.querySelector("a");
    expect(link).toHaveAttribute("href", "https://");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(link).toHaveAttribute("class", "editor-link ltr");
    expect(link).toHaveTextContent("Here is some test content");
  });

  it("can autofocus the editor", async () => {
    const rendered = render(
      <Providers form={store.form}>
        <RichTextEditor
          path="path.to.content"
          content="Here is some test content"
          autoFocusEditor={true}
          ariaLabel="AriaLabel"
        />
      </Providers>
    );

    await act(async () => {
      await promise;
    });

    const contentArea = rendered.container.querySelector('[id^="editor-"]');
    expect(contentArea).toHaveFocus();
  });

  it("can keyboard navigate the RichTextEditor", async () => {
    render(
      <Providers form={store.form}>
        <RichTextEditor
          path="path.to.content"
          content="Here is some test content"
          autoFocusEditor={false}
          ariaLabel="AriaLabel"
        />
      </Providers>
    );

    // rendered.debug();

    await act(async () => {
      await promise;
    });

    const toolbar = screen.getByTestId("toolbar");
    const [h2, h3, bold, italic, bulletList, numberedList, link] =
      within(toolbar).getAllByRole("button");

    expect(document.body).toHaveFocus();

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

  it.skip("can use keyboard shortcuts to apply formatting", async () => {
    //
  });

  it.skip("Updates field on change", async () => {
    // Can I test to see if updateField is called and receives the content and path?
  });
});

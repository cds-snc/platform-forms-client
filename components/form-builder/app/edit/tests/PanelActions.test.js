import React from "react";
import { cleanup, render, act, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { defaultStore as store, Providers } from "@formbuilder/test-utils";
import { PanelActions } from "../PanelActions";

const promise = Promise.resolve();

describe("PanelActions roving index", () => {
  afterEach(() => {
    cleanup();
  });

  it("can keyboard navigate panel actions", async () => {
    // note: there are by default 3 elements in the form in this case we are rendering the middle one
    const item = { id: 1, index: 1, ...store.form.elements[0] };

    render(
      <Providers form={store.form}>
        <PanelActions item={item} renderSaveButton={() => null} />
      </Providers>
    );

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });

    const toolbar = screen.getByTestId("panel-actions");
    const moveUpButton = screen.getByTestId("move-up");
    const moveDownButton = screen.getByTestId("move-down");
    const duplicateButton = screen.getByTestId("duplicate");
    const removeButton = screen.getByTestId("remove");
    const moreButton = screen.getByTestId("more");
    const addElementButton = screen.getByTestId("add-element");

    expect(moveUpButton).toHaveAttribute("tabIndex", "0");
    expect(moveDownButton).toHaveAttribute("tabIndex", "-1");
    expect(duplicateButton).toHaveAttribute("tabIndex", "-1");
    expect(removeButton).toHaveAttribute("tabIndex", "-1");
    expect(moreButton).toHaveAttribute("tabIndex", "-1");
    expect(addElementButton).toHaveAttribute("tabIndex", "0");

    document.body.focus();
    // default focus on document.body
    expect(document.body).toHaveFocus();

    // tab into the toolbar
    await userEvent.tab();
    expect(moveUpButton).toHaveFocus();

    // tab back out
    await userEvent.tab({ shift: true });
    expect(document.body).toHaveFocus();

    // tab back into the toolbar
    await userEvent.tab();
    expect(moveUpButton).toHaveFocus();

    // Arrow Key navigation

    // leftmost item keeps focus
    fireEvent.keyDown(toolbar, { key: "arrowLeft" });
    expect(moveUpButton).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(moveDownButton).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(duplicateButton).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(removeButton).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(moreButton).toHaveFocus();

    // rightmost item keeps focus
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(moreButton).toHaveFocus();

    // tab out of the toolbar
    await userEvent.tab();
    expect(addElementButton).toHaveFocus();

    // tab back into the toolbar
    await userEvent.tab({ shift: true });
    expect(moreButton).toHaveFocus();
  });

  it("can navigate panel actions on the first element", async () => {
    // note: there are by default 3 elements in the form in this case we are rendering the first one
    const item = { id: 1, index: 0, ...store.form.elements[0] };

    render(
      <Providers form={store.form}>
        <PanelActions item={item} renderSaveButton={() => null} />
      </Providers>
    );

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });

    const toolbar = screen.getByTestId("panel-actions");
    const moveUpButton = screen.getByTestId("move-up");
    const moveDownButton = screen.getByTestId("move-down");
    const duplicateButton = screen.getByTestId("duplicate");
    const removeButton = screen.getByTestId("remove");
    const moreButton = screen.getByTestId("more");
    const addElementButton = screen.getByTestId("add-element");

    expect(moveUpButton).toHaveAttribute("tabIndex", "-1");
    expect(moveDownButton).toHaveAttribute("tabIndex", "0");
    expect(duplicateButton).toHaveAttribute("tabIndex", "-1");
    expect(removeButton).toHaveAttribute("tabIndex", "-1");
    expect(moreButton).toHaveAttribute("tabIndex", "-1");
    expect(addElementButton).toHaveAttribute("tabIndex", "0");

    document.body.focus();
    // default focus on document.body
    expect(document.body).toHaveFocus();

    // tab into the toolbar
    await userEvent.tab();
    expect(moveDownButton).toHaveFocus();

    // leftmost item keeps focus
    fireEvent.keyDown(toolbar, { key: "arrowLeft" });
    expect(moveDownButton).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(duplicateButton).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(removeButton).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(moreButton).toHaveFocus();

    // rightmost item keeps focus
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(moreButton).toHaveFocus();

    // tab out of the toolbar
    await userEvent.tab();
    expect(addElementButton).toHaveFocus();

    // tab back into the toolbar
    await userEvent.tab({ shift: true });
    expect(moreButton).toHaveFocus();
  });

  it("can navigate panel actions on the last element", async () => {
    // note: there are by default 3 elements in the form in this case we are rendering the last one
    const item = { id: 1, index: 2, ...store.form.elements[0] };

    render(
      <Providers form={store.form}>
        <PanelActions item={item} renderSaveButton={() => null} />
      </Providers>
    );

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });

    const toolbar = screen.getByTestId("panel-actions");
    const moveUpButton = screen.getByTestId("move-up");
    const moveDownButton = screen.getByTestId("move-down");
    const duplicateButton = screen.getByTestId("duplicate");
    const removeButton = screen.getByTestId("remove");
    const moreButton = screen.getByTestId("more");
    const addElementButton = screen.getByTestId("add-element");

    expect(moveUpButton).toHaveAttribute("tabIndex", "0");
    expect(moveDownButton).toHaveAttribute("tabIndex", "-1");
    expect(duplicateButton).toHaveAttribute("tabIndex", "-1");
    expect(removeButton).toHaveAttribute("tabIndex", "-1");
    expect(moreButton).toHaveAttribute("tabIndex", "-1");
    expect(addElementButton).toHaveAttribute("tabIndex", "0");

    document.body.focus();
    // default focus on document.body
    expect(document.body).toHaveFocus();

    // tab into the toolbar
    await userEvent.tab();
    expect(moveUpButton).toHaveFocus();

    // leftmost item keeps focus
    fireEvent.keyDown(toolbar, { key: "arrowLeft" });
    expect(moveUpButton).toHaveFocus();

    // skips moveDownButton
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(duplicateButton).toHaveFocus();

    // skips moveDownButton
    fireEvent.keyDown(toolbar, { key: "ArrowLeft" });
    expect(moveUpButton).toHaveFocus();

    // skips moveDownButton
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(duplicateButton).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(removeButton).toHaveFocus();

    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(moreButton).toHaveFocus();

    // rightmost item keeps focus
    fireEvent.keyDown(toolbar, { key: "ArrowRight" });
    expect(moreButton).toHaveFocus();

    // tab out of the toolbar
    await userEvent.tab();
    expect(addElementButton).toHaveFocus();

    // tab back into the toolbar
    await userEvent.tab({ shift: true });
    expect(moreButton).toHaveFocus();
  });
});

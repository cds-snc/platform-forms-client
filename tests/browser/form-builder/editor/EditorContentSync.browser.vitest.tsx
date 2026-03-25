import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Editor } from "@root/packages/editor/src";

describe("<Editor /> content sync", () => {
  it("does not replace mounted editor state when the content prop changes", async () => {
    const view = render(
      <div className="form-builder">
        <Editor content="Alpha" ariaLabel="AriaLabel" locale="en" />
      </div>
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();

    view.rerender(
      <div className="form-builder">
        <Editor content="Beta" ariaLabel="AriaLabel" locale="en" />
      </div>
    );

    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeInTheDocument();
    });
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  it("loads the new content after a remount", async () => {
    const view = render(
      <div className="form-builder">
        <Editor key="alpha" content="Alpha" ariaLabel="AriaLabel" locale="en" />
      </div>
    );

    expect(screen.getByText("Alpha")).toBeInTheDocument();

    view.rerender(
      <div className="form-builder">
        <Editor key="beta" content="Beta" ariaLabel="AriaLabel" locale="en" />
      </div>
    );

    await waitFor(() => {
      expect(screen.getByText("Beta")).toBeInTheDocument();
    });
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });
});

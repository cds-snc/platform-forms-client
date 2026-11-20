/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchSelector } from "./SearchSelector";

const items = [
  { id: 1, label: "Personal information", group: "Start" },
  { id: 2, label: "Contact details", group: "Page 1" },
];

describe("SearchSelector", () => {
  it("opens the results when the input receives focus", async () => {
    const user = userEvent.setup();

    render(
      <SearchSelector
        items={items}
        onResult={vi.fn()}
        getItemKey={(item) => item.id}
        getItemLabel={(item) => item.label}
      />
    );

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByText("Personal information")).toBeInTheDocument();
    expect(screen.getByText("Contact details")).toBeInTheDocument();
  });

  it("filters results, renders custom result content, and selects with the keyboard", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();

    render(
      <SearchSelector
        items={items}
        onResult={onResult}
        getItemKey={(item) => item.id}
        getItemLabel={(item) => item.label}
        renderResult={(item) => (
          <>
            <strong>{item.label}</strong>
            <span>{item.group}</span>
          </>
        )}
        label="Question"
      />
    );

    const input = screen.getByRole("combobox", { name: "Question" });
    await user.type(input, "contact");

    expect(screen.queryByText("Personal information")).not.toBeInTheDocument();
    expect(screen.getByText("Contact details")).toBeInTheDocument();
    expect(screen.getByText("Page 1")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{Enter}");

    expect(onResult).toHaveBeenCalledWith(items[1]);
  });

  it("shows a no-results message", async () => {
    const user = userEvent.setup();

    render(
      <SearchSelector
        items={items}
        onResult={vi.fn()}
        getItemKey={(item) => item.id}
        getItemLabel={(item) => item.label}
        noResultsMessage="Nothing found"
      />
    );

    await user.type(screen.getByRole("combobox"), "missing");

    expect(screen.getByText("Nothing found")).toBeInTheDocument();
  });
});

import React, { useState } from "react";
import { render, cleanup } from "@testing-library/react";
import { TagInput } from "../TagInput";
import userEvent from "@testing-library/user-event";

describe("TagInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render and handle keyboard events", async () => {
    const Container = () => {
      const [tags, setTags] = useState([]);

      return <TagInput tags={tags} setTags={setTags} />;
    };

    const rendered = render(<Container />);

    const input = await rendered.findByTestId("tag-input");
    await userEvent.type(input, "test@example.com{enter}");
    expect(rendered.getByText("test@example.com")).toBeInTheDocument();

    const removeButtons = await rendered.findAllByRole("button");
    await userEvent.click(removeButtons[0]);
    expect(rendered.queryByTestId("tags")).toBeNull();

    // handles "enter"
    await userEvent.type(input, "one{enter}");
    await userEvent.type(input, "two{enter}");

    expect(rendered.getByText("one")).toBeInTheDocument();
    expect(rendered.getByText("two")).toBeInTheDocument();

    // handles "backspace"
    await userEvent.type(input, "{backspace}");
    expect(rendered.queryByText("two")).toBeNull();

    // handled "tabbing"
    const removeButtons1 = await rendered.findAllByRole("button");
    await userEvent.tab({ shift: true });
    expect(removeButtons1[0]).toHaveFocus();

    await userEvent.tab();
    const removeButtons2 = await rendered.findAllByRole("button");
    expect(removeButtons2[1]).toHaveFocus();
    await userEvent.tab();
    expect(input).toHaveFocus();
  });
});

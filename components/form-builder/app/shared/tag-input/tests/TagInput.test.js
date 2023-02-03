import React, { useState } from "react";
import { render, cleanup } from "@testing-library/react";
import { TagInput } from "../TagInput";
import userEvent from "@testing-library/user-event";

const validator = (tag) => {
  if (tag === "fail") {
    return false;
  }
  return true;
};

describe("TagInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render and handle keyboard events", async () => {
    const Container = () => {
      const [tags, setTags] = useState([]);

      return <TagInput tags={tags} setTags={setTags} validateTag={validator} />;
    };

    const rendered = render(<Container />);

    const input = await rendered.findByTestId("tag-input");

    // Invalid tag fails validation and is not added
    await userEvent.type(input, "fail{enter}");
    expect(rendered.queryByTestId("tag")).not.toBeInTheDocument();
    expect(input.value).toBe("fail");
    await userEvent.clear(input);

    // Add and remove a tag
    await userEvent.type(input, "one{enter}");
    expect(rendered.getAllByTestId("tag").length).toBe(1);
    expect(rendered.getAllByTestId("tag")[0].textContent).toBe("one");
    const removeButtons = await rendered.findAllByRole("button");
    await userEvent.click(removeButtons[0]);
    expect(rendered.queryByTestId("tag")).toBeNull();
    await userEvent.clear(input);

    // Handles "enter"
    await userEvent.type(input, "one{enter}");
    await userEvent.type(input, "two{enter}");

    expect(rendered.getByText("one")).toBeInTheDocument();
    expect(rendered.getByText("two")).toBeInTheDocument();

    expect(rendered.getAllByTestId("tag").length).toBe(2);
    // Two tags carry forward

    // Handles "comma"
    await userEvent.type(input, "three,");
    await userEvent.type(input, "four,");

    expect(rendered.getByText("three")).toBeInTheDocument();
    expect(rendered.getByText("four")).toBeInTheDocument();

    expect(rendered.getAllByTestId("tag").length).toBe(4);
    // Four tags carry forward

    // Handles "space"
    await userEvent.type(input, "five ");
    await userEvent.type(input, "six ");

    expect(rendered.getByText("five")).toBeInTheDocument();
    expect(rendered.getByText("six")).toBeInTheDocument();

    expect(rendered.getAllByTestId("tag").length).toBe(6);
    // Six tags carry forward

    // Handles "backspace" to untag last tag
    await userEvent.type(input, "{backspace}");
    expect(rendered.getAllByTestId("tag").length).toBe(5);
    expect(input.value).toBe("six");
    await userEvent.clear(input);

    expect(rendered.getAllByTestId("tag").length).toBe(5);
    expect(input.value).toBe("");

    // Handles "tabbing"
    await userEvent.tab({ shift: true });

    // Focus will go to the last tag
    const removeButtons1 = await rendered.findAllByRole("button");
    expect(removeButtons1[removeButtons1.length - 1]).toHaveFocus();

    // Tab to input
    await userEvent.tab();
    expect(input).toHaveFocus();
  });
});

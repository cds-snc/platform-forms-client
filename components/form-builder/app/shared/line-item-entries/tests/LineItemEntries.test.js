import React, { useState } from "react";
import { render, cleanup } from "@testing-library/react";
import { LineItemEntries } from "../LineItemEntries";
import userEvent from "@testing-library/user-event";

// Note: this is currently mostly a copy+paste from ../tag-input/tests/TagInput.test.js. This test
// will probably diverge more and more over time, especially as behavior changes. But noted for
// reference.

const validator = (input) => {
  if (input === "fail") {
    return false;
  }
  return true;
};

describe("LineItemEntries", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render and handle keyboard events", async () => {
    const Container = () => {
      const [inputs, setInputs] = useState([]);

      return (
        <LineItemEntries
          inputs={inputs}
          setInputs={setInputs}
          validateInput={validator}
          inputLabelId="inputLabelId"
        />
      );
    };

    const rendered = render(<Container />);

    const input = await rendered.findByTestId("value-input");

    // Invalid LineEntry fails validation and is not added
    await userEvent.type(input, "fail{enter}");
    expect(rendered.queryByTestId("value")).not.toBeInTheDocument();
    expect(input.value).toBe("fail");
    await userEvent.clear(input);

    // Add and remove a value
    await userEvent.type(input, "one{enter}");
    expect(rendered.getAllByTestId("value").length).toBe(1);
    expect(rendered.getAllByTestId("value")[0].textContent).toBe("one");
    const removeButtons = await rendered.findAllByRole("button");
    await userEvent.click(removeButtons[0]);
    expect(rendered.queryByTestId("value")).toBeNull();
    await userEvent.clear(input);

    // Handles "enter"
    await userEvent.type(input, "one{enter}");
    await userEvent.type(input, "two{enter}");

    expect(rendered.getByText("one")).toBeInTheDocument();
    expect(rendered.getByText("two")).toBeInTheDocument();

    expect(rendered.getAllByTestId("value").length).toBe(2);
    // Two values carry forward

    // Handles "comma"
    await userEvent.type(input, "three,");
    await userEvent.type(input, "four,");

    expect(rendered.getByText("three")).toBeInTheDocument();
    expect(rendered.getByText("four")).toBeInTheDocument();

    expect(rendered.getAllByTestId("value").length).toBe(4);
    // Four values carry forward

    // Handles "space"
    await userEvent.type(input, "five ");
    await userEvent.type(input, "six ");

    expect(rendered.getByText("five")).toBeInTheDocument();
    expect(rendered.getByText("six")).toBeInTheDocument();

    expect(rendered.getAllByTestId("value").length).toBe(6);
    // Six values carry forward

    // Handles "backspace" to unvalue last value
    await userEvent.type(input, "{backspace}");
    expect(rendered.getAllByTestId("value").length).toBe(5);
    expect(input.value).toBe("six");
    await userEvent.clear(input);

    expect(rendered.getAllByTestId("value").length).toBe(5);
    expect(input.value).toBe("");

    // Handles onBlur
    await userEvent.type(input, "six");
    await userEvent.tab();
    expect(rendered.getAllByTestId("value").length).toBe(6);

    // Handles "tabbing"
    await userEvent.tab({ shift: true });
    expect(input).toHaveFocus();

    await userEvent.tab({ shift: true });
    const removeButtons1 = await rendered.findAllByRole("button");
    expect(removeButtons1[removeButtons1.length - 1]).toHaveFocus();

    // Tab to input
    await userEvent.tab();
    expect(input).toHaveFocus();
  });
});

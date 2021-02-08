import React from "react";
import { render } from "@testing-library/react";
import Form from "../Form/Form";
import { Radio } from "./Radio";

describe("Radio component", () => {
  const text = "My radio button";
  it("renders without errors", async () => {
    const { queryByTestId, queryByText } = render(
      <Form>
        <Radio id="input-radio" name="input-radio" label={text} />
      </Form>
    );
    expect(queryByTestId("radio")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});

import React from "react";
import { render } from "@testing-library/react";

import { DynamicForm } from "./DynamicForm";

describe("DynamicForm component", () => {
  const text = "This is a description";
  it("renders without errors", () => {
    const { queryByTestId, queryByText } = render(
      <DynamicForm formMetadata={{ elements: null }}><p>{text}</p></DynamicForm>
    );
    expect(queryByTestId("description")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});

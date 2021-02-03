import React from "react";
import { render } from "@testing-library/react";
import { Formik } from "formik";
import { Radio } from "./Radio";

describe("Radio component", () => {
  const text = "My radio button";
  it("renders without errors", async () => {
    const { queryByTestId, queryByText } = render(
      <Formik
        initialValues={{
          "input-radio": "",
        }}
        onSubmit={() => {}}
      >
      <Radio id="input-radio" name="input-radio" label={text} />
      </Formik>
    );
    expect(queryByTestId("radio")).toBeInTheDocument();
    expect(queryByText(text)).toBeInTheDocument();
  });
});

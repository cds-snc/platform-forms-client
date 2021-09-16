import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Base from "./Base";
import Form from "../forms/Form/Form";

const formConfigTest = {
  id: 1,
  version: 1,
  titleEn: "Test Form",
  titleFr: "Formulaire de test",
  layout: [1, 2],
  elements: [],
};

describe("Generate the Base structure of a page", () => {
  afterEach(cleanup);

  test("Alpha banner should be displayed if form property is set to true", () => {
    render(
      <Base>
        <Form
          formConfig={{ displayAlphaBanner: true, ...formConfigTest }}
          language="en"
          t={(key) => key}
        ></Form>
      </Base>
    );

    expect(screen.queryByTestId("PhaseBanner")).toBeInTheDocument();
  });

  test("Alpha banner should be hidden if form property is set to false", () => {
    render(
      <Base>
        <Form
          formConfig={{ displayAlphaBanner: false, ...formConfigTest }}
          language="en"
          t={(key) => key}
        ></Form>
      </Base>
    );

    expect(screen.queryByTestId("PhaseBanner")).not.toBeInTheDocument();
  });
});

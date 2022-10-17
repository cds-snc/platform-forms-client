import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import Base from "./Base";
import { Form } from "@components/forms";
import { SessionProvider } from "next-auth/react";

describe("Generate the Base structure of a page", () => {
  afterEach(cleanup);

  test("Alpha banner should be displayed if form property is set to true", () => {
    const formRecordTest = {
      form: {
        id: 1,
        version: 1,
        titleEn: "Test Form",
        titleFr: "Formulaire de test",
        layout: [1, 2],
        elements: [],
      },
      displayAlphaBanner: true,
    };

    render(
      <SessionProvider session={null}>
        <Base>
          <Form formRecord={formRecordTest} language="en" t={(key) => key} />
        </Base>
      </SessionProvider>
    );

    expect(screen.queryByTestId("PhaseBanner")).toBeInTheDocument();
  });

  test("Alpha banner should be hidden if form property is set to false", () => {
    const formRecordTest = {
      form: {
        id: 1,
        version: 1,
        titleEn: "Test Form",
        titleFr: "Formulaire de test",
        layout: [1, 2],
        elements: [],
      },
      displayAlphaBanner: false,
    };
    render(
      <SessionProvider session={null}>
        <Base>
          <Form formRecord={formRecordTest} language="en" t={(key) => key} />
        </Base>
      </SessionProvider>
    );

    expect(screen.queryByTestId("PhaseBanner")).not.toBeInTheDocument();
  });
});

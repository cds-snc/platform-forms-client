import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import DefaultLayout from "./DefaultLayout";
import { SessionProvider } from "next-auth/react";

jest.mock("next/router", () => require("next-router-mock"));

describe("Generate the Base structure of a page", () => {
  afterEach(cleanup);

  test("FIP should be displayed", () => {
    render(
      <SessionProvider session={null}>
        <DefaultLayout>
          <div>test</div>
        </DefaultLayout>
      </SessionProvider>
    );

    expect(screen.queryByTestId("fip")).toBeInTheDocument();
  });
});

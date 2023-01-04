import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import BaseLayout from "./BaseLayout";
import { SessionProvider } from "next-auth/react";

describe("Generate the Base structure of a page", () => {
  afterEach(cleanup);

  test("FIP should be displayed", () => {
    render(
      <SessionProvider session={null}>
        <BaseLayout>
          <div>test</div>
        </BaseLayout>
      </SessionProvider>
    );

    expect(screen.queryByTestId("fip")).toBeInTheDocument();
  });
});

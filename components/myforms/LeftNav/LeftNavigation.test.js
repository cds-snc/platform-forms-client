import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { LeftNavigation } from "@components/myforms/LeftNav/LeftNavigation";

const useRouter = jest.spyOn(require("next/router"), "useRouter");

const tabsData = {
  id: "title-tabs",
  title: "Tabs Title",
};

describe("LeftNavigation component", () => {
  afterEach(cleanup);

  test("renders without errors and has active state", () => {
    useRouter.mockImplementationOnce(() => ({
      query: { path: "published" },
    }));

    const rendered = render(
      <>
        <h2 id={tabsData.id}>{tabsData.title}</h2>
        <LeftNavigation />
      </>
    );

    expect(screen.getByText(/nav.drafts/i)).toBeInTheDocument();
    expect(screen.getByText(/nav.published/i)).toBeInTheDocument();
    expect(rendered.container.querySelector(".font-bold")).toHaveTextContent(/nav.published/i);
    expect(screen.getByText(/nav.all/i)).toBeInTheDocument();
  });
});

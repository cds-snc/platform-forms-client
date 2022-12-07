import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { LeftNavigation } from "@components/myforms/LeftNav";

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

    render(
      <>
        <h2 id={tabsData.id}>{tabsData.title}</h2>
        <LeftNavigation />
      </>
    );
    expect(screen.getByText(/nav.drafts/i)).toBeInTheDocument();
    expect(screen.getByText(/nav.published/i)).toBeInTheDocument();
    expect(screen.getByText(/nav.published/i)).toHaveClass("font-bold");
    expect(screen.getByText(/nav.all/i)).toBeInTheDocument();
  });
});

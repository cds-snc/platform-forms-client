import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { FormSettings, } from "./Settings";
import mockedAxios from "axios";
import { useRouter } from "next/router";

jest.mock("axios");
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Form Settings Page", () => {
  afterEach(cleanup);
  const form = {
    formID: 15,
    formConfig: { test: "test JSON" },
  };
  test("renders without errors", () => {
    render(<FormSettings form={form}></FormSettings>);
    expect(screen.queryByText("Form ID: 15")).toBeInTheDocument();
  });

  test("Delete button redirects on success", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
    });
    const push = jest.fn();
    useRouter.mockImplementation(() => ({
      asPath: "/",
      push: push(),
    }));
    render(<FormSettings form={form}></FormSettings>);

    await fireEvent.click(screen.queryByTestId("delete"));
    expect(push).toHaveBeenCalled();
  });
});

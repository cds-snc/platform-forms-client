/*
Refactored out into Page Component vs Server Component

https://github.com/nextauthjs/next-auth/issues/4866
unstable_getServerSession breaks Jest tests due to "node_modules/jose/" dependency

Thile file tests a NextJS Page which requires both serverside and client side dependencies.
The 'jose' lib in next-auth loads the browser version because the test environment is set to 'jsdom'.
However the 'requireAuthentication' lib which is referenced as an import in the 'settings.tsx' file requires the mode version.

***********************************************************
*/

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Settings from "@components/admin/TemplateDelete/Settings";
import mockedAxios from "axios";
import { useRouter } from "next/router";
import validFormTemplate from "../../../__fixtures__/validFormTemplate.json";

jest.mock("axios");
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock your i18n
jest.mock("next-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        language: "en",
        changeLanguage: () => Promise.resolve(),
      },
    };
  },
}));

describe("Form Settings Page", () => {
  afterEach(cleanup);
  const form = {
    id: "test0form00000id000asdf11",
    isPublished: true,
    ...validFormTemplate,
  };
  test("renders without errors", () => {
    useRouter.mockImplementation(() => ({
      query: {},
    }));
    render(<Settings form={form}></Settings>);
    expect(screen.queryByText("Form Title:")).toBeInTheDocument();
    expect(screen.getByTestId("formID")).toHaveTextContent(
      "Public Service Award of Excellence 2020 - Nomination form"
    );
    expect(screen.queryByText("Form ID:")).toBeInTheDocument();
    expect(screen.getByTestId("formID")).toHaveTextContent("test0form00000id000asdf11");
  });

  test("Delete button redirects on success", async () => {
    const user = userEvent.setup();
    mockedAxios.mockResolvedValue({
      status: 200,
    });
    const push = jest.fn();
    useRouter.mockImplementation(() => ({
      asPath: "/",
      push: push,
    }));
    render(<Settings form={form}></Settings>);

    await user.click(screen.queryByTestId("delete"));
    expect(screen.queryByTestId("confirmDelete")).toBeInTheDocument();

    await user.click(screen.queryByTestId("confirmDelete"));
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/templates/test0form00000id000asdf11", method: "DELETE" })
    );
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });
  test("Logs errors on failure", async () => {
    const user = userEvent.setup();
    mockedAxios.mockRejectedValue({
      status: 400,
    });
    // I wanted to spy console.error but it didn't want to work
    // for now, the handler here calls JSON.stringify so we can spy that
    const spy = jest.spyOn(JSON, "stringify");

    render(<Settings form={form}></Settings>);

    await user.click(screen.queryByTestId("delete"));
    expect(screen.queryByTestId("confirmDelete")).toBeInTheDocument();

    await user.click(screen.queryByTestId("confirmDelete"));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/templates/test0form00000id000asdf11", method: "DELETE" })
    );
  });
});

/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import Page from "./page";

const { checkOne, cookies } = vi.hoisted(() => ({
  checkOne: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock("@i18n", () => ({
  serverTranslation: vi.fn().mockResolvedValue({
    t: (key: string) => key,
  }),
}));

vi.mock("@lib/cache/flags", () => ({
  checkOne,
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("./components/LocalTime", () => ({
  LocalTime: () => <div data-testid="local-time" />,
}));

vi.mock("./components/SignInButton", () => ({
  SignInButton: () => <button data-testid="oidc-sign-in">Sign in with OIDC</button>,
}));

vi.mock("@serverComponents/globals/Buttons/LinkButton", () => ({
  LinkButton: {
    Primary: ({ href, children }: { href: string; children: React.ReactNode }) => (
      <a href={href} data-testid="standard-sign-in">
        {children}
      </a>
    ),
  },
}));

describe("logout page", () => {
  const originalAppEnv = process.env.APP_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_ENV = "development";
    checkOne.mockResolvedValue(true);
    cookies.mockResolvedValue({
      get: vi.fn(() => undefined),
    });
  });

  afterAll(() => {
    process.env.APP_ENV = originalAppEnv;
  });

  const renderPage = async () => render(await Page({ params: Promise.resolve({ locale: "en" }) }));

  it("uses the standard sign-in link when the hint cookie is missing", async () => {
    await renderPage();

    expect(screen.getByTestId("standard-sign-in")).toHaveAttribute("href", "/en/auth/login");
    expect(screen.queryByTestId("oidc-sign-in")).not.toBeInTheDocument();
  });

  it("uses OIDC when the hint cookie is set", async () => {
    cookies.mockResolvedValue({
      get: vi.fn(() => ({ value: "gc-platform" })),
    });

    await renderPage();

    expect(screen.getByTestId("oidc-sign-in")).toBeInTheDocument();
    expect(screen.queryByTestId("standard-sign-in")).not.toBeInTheDocument();
  });

  it("uses the standard sign-in link when the hint cookie has an unexpected value", async () => {
    cookies.mockResolvedValue({
      get: vi.fn(() => ({ value: "unexpected" })),
    });

    await renderPage();

    expect(screen.getByTestId("standard-sign-in")).toBeInTheDocument();
    expect(screen.queryByTestId("oidc-sign-in")).not.toBeInTheDocument();
  });
});

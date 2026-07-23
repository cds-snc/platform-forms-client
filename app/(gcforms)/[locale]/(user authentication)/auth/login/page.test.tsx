/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import Page from "./page";

const { checkOne, cookies, authCheckAndThrow, redirect } = vi.hoisted(() => ({
  checkOne: vi.fn(),
  cookies: vi.fn(),
  authCheckAndThrow: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@i18n", () => ({
  serverTranslation: vi.fn(async () => ({
    t: (key: string, options?: { deadline?: string }) => {
      if (key === "migrationPanel.bodyDeadline") {
        return `deadline ${options?.deadline}`;
      }
      return key;
    },
  })),
}));

vi.mock("@lib/cache/flags", () => ({
  checkOne,
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("@lib/actions", () => ({
  authCheckAndThrow,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("./components/client/LoginForm", () => ({
  LoginForm: () => <div data-testid="login-form">login form</div>,
}));

vi.mock("./components/client/OidcRedirect", () => ({
  OidcRedirect: ({ locale }: { locale: string }) => (
    <div data-testid="oidc-redirect">oidc {locale}</div>
  ),
}));

vi.mock("./components/client/GcPlatformSignInButton", () => ({
  GcPlatformSignInButton: ({ label }: { label: string }) => <button>{label}</button>,
}));

describe("login page", () => {
  const originalAppEnv = process.env.APP_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_ENV = "development";
    authCheckAndThrow.mockRejectedValue(new Error("no session"));
    cookies.mockResolvedValue({
      get: vi.fn(() => undefined),
      delete: vi.fn(),
    });
  });

  afterAll(() => {
    process.env.APP_ENV = originalAppEnv;
  });

  it("renders the standard login form when the GC Platform flow is disabled", async () => {
    checkOne.mockResolvedValue(false);

    render(
      await Page({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.queryByTestId("oidc-redirect")).not.toBeInTheDocument();
  });

  it("renders the standard login form when the GC Platform flow is enabled without the hint cookie", async () => {
    checkOne.mockResolvedValue(true);

    render(
      await Page({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.queryByTestId("oidc-redirect")).not.toBeInTheDocument();
  });

  it("redirects returning GC Platform users into the OIDC flow when the hint cookie is set", async () => {
    checkOne.mockResolvedValue(true);
    cookies.mockResolvedValue({
      get: vi.fn(() => ({ value: "gc-platform" })),
    });

    render(
      await Page({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByTestId("oidc-redirect")).toBeInTheDocument();
    expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
  });

  it("clears the platform hint cookie when requested via query param", async () => {
    const deleteCookie = vi.fn();

    checkOne.mockResolvedValue(true);
    cookies.mockResolvedValue({
      get: vi.fn(() => ({ value: "gc-platform" })),
      delete: deleteCookie,
    });

    render(
      await Page({
        params: Promise.resolve({ locale: "en" }),
        searchParams: Promise.resolve({ clearPlatformLoginHint: "1" }),
      })
    );

    expect(deleteCookie).toHaveBeenCalledWith("gc-platform-login");
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.queryByTestId("oidc-redirect")).not.toBeInTheDocument();
  });
});

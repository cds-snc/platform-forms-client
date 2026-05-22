import { describe, it, expect, beforeAll, vi, beforeEach } from "vitest";
import { page } from "vitest/browser";
import { useSession } from "next-auth/react";
import { AccountMenu } from "@formBuilder/components/shared/account-menu/AccountMenu";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.css";

// Mock next-auth
vi.mock("next-auth/react", async () => {
  const actual = await vi.importActual("next-auth/react");
  return {
    ...actual,
    useSession: vi.fn(),
  };
});

// Mock session data
const mockSession = {
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    accountUrl: "https://account.example.com",
    privileges: [],
    acceptableUse: true,
    hasSecurityQuestions: true,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

describe("<AccountMenu />", () => {
  beforeAll(() => {
    setupFonts();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Publishing states", () => {
    it("Renders with emerald background when publishingEnabled is true", async () => {
      vi.mocked(useSession).mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: vi.fn(),
      });

      await render(
        <AccountMenu
          locale="en"
          testId="account-menu-test"
          publishingEnabled={true}
          placement="header"
        />
      );

      const button = page.getByRole("button", { name: /account/i });
      await button.click();

      const header = page.getByTestId("account-menu-header");
      await expect.element(header).toHaveClass("bg-emerald-50");

      const publishingStatus = page.getByTestId("account-menu-publishing-status");
      await expect.element(publishingStatus).toBeVisible();

      const indicator = page.getByTestId("account-menu-publishing-indicator");
      await expect.element(indicator).toHaveClass("bg-emerald-600");
    });

    it("Renders with yellow background when publishingEnabled is false", async () => {
      vi.mocked(useSession).mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: vi.fn(),
      });

      await render(
        <AccountMenu
          locale="en"
          testId="account-menu-test"
          publishingEnabled={false}
          placement="header"
        />
      );

      const button = page.getByRole("button", { name: /account/i });
      await button.click();

      const header = page.getByTestId("account-menu-header");
      await expect.element(header).toHaveClass("bg-yellow-50");

      const publishingStatus = page.getByTestId("account-menu-publishing-status");
      await expect.element(publishingStatus).toBeVisible();

      const indicator = page.getByTestId("account-menu-publishing-indicator");
      await expect.element(indicator).toHaveClass("bg-yellow-700");
    });

    it("Renders with grey background when publishingEnabled is undefined", async () => {
      vi.mocked(useSession).mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: vi.fn(),
      });

      await render(<AccountMenu locale="en" testId="account-menu-test" placement="header" />);

      const button = page.getByRole("button", { name: /account/i });
      await button.click();

      const header = page.getByTestId("account-menu-header");
      await expect.element(header).toHaveClass("bg-slate-100");
    });

    it("Hides publishing status section when publishingEnabled is undefined", async () => {
      vi.mocked(useSession).mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: vi.fn(),
      });

      await render(<AccountMenu locale="en" testId="account-menu-test" placement="header" />);

      const button = page.getByRole("button", { name: /account/i });
      await button.click();

      const publishingStatus = document.querySelector(
        '[data-testid="account-menu-publishing-status"]'
      );
      expect(publishingStatus).toBeNull();
    });

    it("Shows publishing status section when publishingEnabled is true", async () => {
      vi.mocked(useSession).mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: vi.fn(),
      });

      await render(
        <AccountMenu
          locale="en"
          testId="account-menu-test"
          publishingEnabled={true}
          placement="header"
        />
      );

      const button = page.getByRole("button", { name: /account/i });
      await button.click();

      const publishingStatus = page.getByTestId("account-menu-publishing-status");
      await expect.element(publishingStatus).toBeVisible();
    });

    it("Shows publishing status section when publishingEnabled is false", async () => {
      vi.mocked(useSession).mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: vi.fn(),
      });

      await render(
        <AccountMenu
          locale="en"
          testId="account-menu-test"
          publishingEnabled={false}
          placement="header"
        />
      );

      const button = page.getByRole("button", { name: /account/i });
      await button.click();

      const publishingStatus = page.getByTestId("account-menu-publishing-status");
      await expect.element(publishingStatus).toBeVisible();
    });
  });
});

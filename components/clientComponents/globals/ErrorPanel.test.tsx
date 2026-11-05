/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { logMessage } from "@lib/logger";
import { ErrorPanel } from "./ErrorPanel";

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@lib/client/clientHelpers", () => ({
  ga: vi.fn(),
}));

const sessionCallsOnImport = vi.mocked(getSession).mock.calls.length;
const session: Session = {
  user: {
    id: "test-user",
    email: "test@example.com",
    name: "Test User",
    privileges: [],
    acceptableUse: true,
    hasSecurityQuestions: true,
  },
  expires: "2099-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.mocked(getSession).mockReset();
  vi.mocked(getSession).mockResolvedValue(null);
});

afterEach(cleanup);

describe("ErrorPanel", () => {
  it("does not fetch the session when imported or prerendered", () => {
    expect(sessionCallsOnImport).toBe(0);

    const html = renderToString(<ErrorPanel />);

    expect(getSession).not.toHaveBeenCalled();
    expect(html).toContain("errorPanel.defaultTitle");
    expect(html).toContain("https://articles.alpha.canada.ca/forms-formulaires/");
  });

  it("links authenticated users to their forms after mounting", async () => {
    vi.mocked(getSession).mockResolvedValue(session);

    render(<ErrorPanel />);

    expect(await screen.findByRole("link", { name: "errorPanel.cta.yourForms" })).toHaveAttribute(
      "href",
      "/en/forms"
    );
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it("keeps the public home link for unauthenticated users", async () => {
    render(<ErrorPanel />);

    await waitFor(() => expect(getSession).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("link", { name: "errorPanel.cta.home" })).toHaveAttribute(
      "href",
      "https://articles.alpha.canada.ca/forms-formulaires/"
    );
  });

  it("reads a fresh session when mounted again", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(session).mockResolvedValueOnce(null);

    const { unmount } = render(<ErrorPanel />);
    await screen.findByRole("link", { name: "errorPanel.cta.yourForms" });
    unmount();

    render(<ErrorPanel />);

    await waitFor(() => expect(getSession).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("link", { name: "errorPanel.cta.home" })).toBeInTheDocument();
  });

  it("logs session lookup failures without breaking the error panel", async () => {
    const error = new Error("Session lookup failed");
    vi.mocked(getSession).mockRejectedValue(error);

    render(<ErrorPanel />);

    await waitFor(() => expect(logMessage.error).toHaveBeenCalledWith(error));
    expect(screen.getByRole("heading", { name: "errorPanel.defaultTitle" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "errorPanel.cta.home" })).toBeInTheDocument();
  });
});

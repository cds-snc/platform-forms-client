/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { useParams } from "next/navigation";

import { Card } from "./Card";
import { TAB_STATUS, type FormsTemplateWithLockInfo } from "../types";

vi.mock("../client/DraftEditLink", () => ({
  DraftEditLink: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("../client/Menu", () => ({
  Menu: () => <div data-testid="card-menu" />,
}));

vi.mock("../client/Unarchive", () => ({
  Unarchive: () => null,
}));

vi.mock("@gcforms/announce", () => ({
  announce: vi.fn(),
  Priority: { HIGH: "high" },
}));

const mockedUseParams = vi.mocked(useParams);

describe("Card", () => {
  beforeEach(() => {
    mockedUseParams.mockReturnValue({ locale: "en" });
  });

  it("links the published status to the live form and leaves the draft version unlinked for published drafts on the drafts tab", async () => {
    const card: FormsTemplateWithLockInfo = {
      id: "form-123",
      titleEn: "My form",
      titleFr: "Mon formulaire",
      deliveryOption: { emailAddress: "" },
      name: "My form - v2",
      isPublished: true,
      hasDraft: true,
      currentDraftVersion: 3,
      currentPublishedVersion: 2,
      ttl: null,
      date: new Date("2026-07-20T00:00:00.000Z").toISOString(),
      overdue: false,
      hasEditLock: false,
      collaboratorCount: {
        userCount: 1,
        pendingUserCount: 0,
      },
      closingDate: null,
      lastEditedBy: null,
    };

    render(<Card card={card} status={TAB_STATUS.DRAFT} />);

    expect(screen.getByText("Published- version 2").closest("a")).toHaveAttribute(
      "href",
      "/en/id/form-123"
    );
    expect(screen.queryByRole("link", { name: "Draft - version 3" })).not.toBeInTheDocument();
    expect(screen.getByText("Draft - version 3")).toBeInTheDocument();
  });
});

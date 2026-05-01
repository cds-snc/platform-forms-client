it("shows takeover available message and button when lock is expired", async () => {
  const takeover = vi.fn().mockResolvedValue(undefined);
  await render(
    <EditLockBannerHarness editLock={null} isLockedByOther={true} takeover={takeover} />
  );

  const message = page.getByText(
    "The form is now free to edit. You can take over editing this form."
  );
  await expect.element(message).toBeVisible();

  const button = page.getByRole("button", { name: "Take over editing" });
  await expect.element(button).toBeVisible();
  await button.click();
  expect(takeover).toHaveBeenCalled();
});
import { useEffect } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { EditLockBanner } from "@formBuilder/components/shared/edit-lock/EditLockBanner";
import { type EditLockState } from "@lib/store/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.css";

const buildLock = (overrides?: Partial<EditLockState>) => ({
  lockedByName: "Avery Smith",
  lockedByEmail: "avery@example.com",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  lastActivityAt: new Date(Date.now() - 30_000).toISOString(),
  presenceStatus: "active" as const,
  ...overrides,
});

function EditLockBannerHarness({
  editLock,
  isLockedByOther,
  takeover,
}: {
  editLock: EditLockState | null;
  isLockedByOther: boolean;
  takeover: () => Promise<void>;
}) {
  const setEditLock = useTemplateStore((state) => state.setEditLock);
  const setIsLockedByOther = useTemplateStore((state) => state.setIsLockedByOther);

  useEffect(() => {
    setEditLock(editLock);
    setIsLockedByOther(isLockedByOther);
  }, [editLock, isLockedByOther, setEditLock, setIsLockedByOther]);

  return <EditLockBanner takeover={takeover} getIsActiveTab={() => true} />;
}

describe("<EditLockBanner />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("renders the lock banner and takeover action", async () => {
    await render(
      <EditLockBannerHarness
        editLock={buildLock()}
        isLockedByOther={true}
        takeover={vi.fn().mockResolvedValue(undefined)}
      />
    );

    const title = page.getByText("This form is already being edited");
    await expect.element(title).toBeVisible();

    const pilotBadge = page.getByText("Pilot:", { exact: false });
    await expect.element(pilotBadge).toBeVisible();

    const message = page.getByText(
      "Avery Smith is currently working on this form, which means you cannot make changes unless you take over."
    );
    await expect.element(message).toBeVisible();

    const button = page.getByRole("button", { name: "Take over editing" });
    await expect.element(button).toBeVisible();
  });

  it("shows presence details and marks the lock as stale near expiry", async () => {
    await render(
      <EditLockBannerHarness
        editLock={buildLock({ expiresAt: new Date(Date.now() + 5_000).toISOString() })}
        isLockedByOther={true}
        takeover={vi.fn().mockResolvedValue(undefined)}
      />
    );

    const status = page.getByText("Connection stale");
    await expect.element(status).toBeVisible();

    const statusText = await status.element().textContent;
    expect(statusText).toContain("Connection stale");

    const lastActivity = page.getByText("Last activity:", { exact: false });
    await expect.element(lastActivity).toBeVisible();

    const lastActivityText = await lastActivity.element().textContent;
    expect(lastActivityText).toContain("Last activity:");
  });

  it("shows an error when takeover fails", async () => {
    await render(
      <EditLockBannerHarness
        editLock={buildLock({ lockedByName: null, lockedByEmail: "avery@example.com" })}
        isLockedByOther={true}
        takeover={vi.fn().mockRejectedValue(new Error("takeover failed"))}
      />
    );

    const button = page.getByRole("button", { name: "Take over editing" });
    await button.click();

    const error = page.getByText("Unable to take over. Please try again.");
    await expect.element(error).toBeVisible();
  });

  it("shows a loading state while takeover is in progress", async () => {
    const takeover = vi.fn(() => new Promise<void>(() => undefined));

    await render(
      <EditLockBannerHarness editLock={buildLock()} isLockedByOther={true} takeover={takeover} />
    );

    await page.getByRole("button", { name: "Take over editing" }).click();

    const loading = page.getByText("Syncing the latest saved version of this form...");
    await expect.element(loading).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Taking over..." })).toBeDisabled();
  });
});

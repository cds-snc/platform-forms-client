import { useEffect } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { SaveButton } from "@formBuilder/components/shared/SaveButton";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.css";

const waitForSaveAvailability = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 2100));
};

const saveDraft = vi.fn();
const saveDraftIfNeeded = vi.fn(async () => ({ status: "skipped" as const }));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "user-1" } },
    status: "authenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCsrfToken: vi.fn(),
  getProviders: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/form-builder/test-form-id/translate",
  useParams: () => ({ locale: "en" }),
}));

vi.mock("@lib/hooks/form-builder/useTemplateContext", () => ({
  useTemplateContext: () => ({
    saveDraft,
    saveDraftIfNeeded,
    templateIsDirty: { current: true },
    updatedAt: undefined,
  }),
}));

const buildLock = () => ({
  lockedByName: "Avery Smith",
  lockedByEmail: "avery@example.com",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  lastActivityAt: new Date(Date.now() - 30_000).toISOString(),
  presenceStatus: "active" as const,
});

function SaveButtonHarness({ isLockedByOther = false }: { isLockedByOther?: boolean }) {
  const setEditLock = useTemplateStore((state) => state.setEditLock);
  const setIsLockedByOther = useTemplateStore((state) => state.setIsLockedByOther);
  const setIsPublished = useTemplateStore((state) => state.setIsPublished);

  useEffect(() => {
    setEditLock(buildLock());
    setIsLockedByOther(isLockedByOther);
    setIsPublished(false);
  }, [isLockedByOther, setEditLock, setIsLockedByOther, setIsPublished]);

  return <SaveButton />;
}

describe("<SaveButton />", () => {
  beforeAll(() => {
    setupFonts();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the generic save error for regular failures", async () => {
    saveDraft.mockResolvedValueOnce({ status: "error" as const });

    await render(<SaveButtonHarness />);
    await waitForSaveAvailability();

    await page.getByRole("button", { name: "Save draft" }).click();

    const error = page.getByText("Saving failed - Contact support");
    await expect.element(error).toBeVisible();
  });

  it("shows a lock-specific message when saving fails because the form is locked", async () => {
    saveDraft.mockResolvedValueOnce({ status: "locked" as const });

    await render(<SaveButtonHarness />);
    await waitForSaveAvailability();

    await page.getByRole("button", { name: "Save draft" }).click();

    const error = page.getByText("Saving blocked: Avery Smith is editing this form.");
    await expect.element(error).toBeVisible();
  });
});

import { useEffect, useState } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { SaveButton } from "@formBuilder/components/shared/SaveButton";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { render, TestWrapper } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";
import { type TemplateValidationProblem } from "@lib/utils/form-builder/validate";

import "@root/styles/app.css";

const waitForSaveAvailability = async () => {
  await new Promise((resolve) => window.setTimeout(resolve, 2100));
};

const saveDraft = vi.fn();
const setShowValidationErrors = vi.fn();
const validationProblems = vi.fn<() => TemplateValidationProblem[]>(() => []);
const saveDraftIfNeeded = vi.fn(async () => ({ status: "skipped" as const }));
const replace = vi.fn();
let pathname = "/en/form-builder/test-form-id/translate";

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
  usePathname: () => pathname,
  useRouter: () => ({ replace }),
  useParams: () => ({ locale: "en" }),
}));

vi.mock("@lib/hooks/form-builder/useTemplateContext", () => ({
  useTemplateContext: () => {
    const [showValidationErrors, setShow] = useState(false);
    return {
      saveDraft,
      saveDraftIfNeeded,
      templateIsDirty: { current: true },
      updatedAt: undefined,
      showValidationErrors,
      setShowValidationErrors: (show: boolean) => {
        setShowValidationErrors(show);
        setShow(show);
      },
    };
  },
}));

vi.mock("@lib/store/hooks/useTemplateValidationProblems", () => ({
  useTemplateValidationProblems: () => validationProblems(),
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

function ValidationErrorsHarness() {
  return (
    <>
      <SaveButtonHarness />
      <div id="template-validation-errors" tabIndex={-1}>
        Fix the errors before saving.
      </div>
    </>
  );
}

describe("<SaveButton />", () => {
  beforeAll(() => {
    setupFonts();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    validationProblems.mockReturnValue([]);
    pathname = "/en/form-builder/test-form-id/translate";
  });

  it("shows the generic save error for regular failures", async () => {
    saveDraft.mockResolvedValueOnce({ status: "error" as const });

    await render(<SaveButtonHarness />);
    await waitForSaveAvailability();

    await page.getByRole("button", { name: "Save draft" }).click();

    const error = page.getByText("Saving failed - Contact support");
    await expect.element(error).toBeVisible();
    expect(setShowValidationErrors).not.toHaveBeenCalled();
  });

  it("shows a lock-specific message when saving fails because the form is locked", async () => {
    saveDraft.mockResolvedValueOnce({ status: "locked" as const });

    await render(<SaveButtonHarness />);
    await waitForSaveAvailability();

    await page.getByRole("button", { name: "Save draft" }).click();

    const error = page.getByText("Saving blocked: Avery Smith is editing this form.");
    await expect.element(error).toBeVisible();
  });

  it("focuses validation errors without showing a support error and allows saving again", async () => {
    pathname = "/en/form-builder/test-form-id/edit";
    validationProblems.mockReturnValue([
      { path: "elements.0.properties.choices", name: "uniqueItems", message: "Duplicate choices" },
    ]);
    saveDraft.mockResolvedValueOnce({ status: "validation-error" as const });

    const view = await render(<ValidationErrorsHarness />);
    await waitForSaveAvailability();
    expect(setShowValidationErrors).not.toHaveBeenCalled();
    await expect
      .element(page.getByRole("link", { name: "Not saved - Fix errors" }))
      .not.toBeInTheDocument();
    await page.getByRole("button", { name: "Save draft" }).click();

    expect(setShowValidationErrors).toHaveBeenCalledWith(true);
    await expect.element(page.getByText("Fix the errors before saving.")).toHaveFocus();
    await expect.element(page.getByText("Saving failed - Contact support")).not.toBeInTheDocument();
    await expect.element(page.getByRole("button", { name: "Save draft" })).toBeVisible();
    const indicator = page.getByRole("link", { name: "Not saved - Fix errors" });
    await expect.element(indicator).toBeVisible();
    await expect
      .element(indicator)
      .toHaveAttribute("href", "/en/form-builder/test-form-id/edit#template-validation-errors");

    await view.rerender(
      <TestWrapper>
        <ValidationErrorsHarness />
      </TestWrapper>
    );
    await expect.element(indicator).toBeVisible();
    validationProblems.mockReturnValue([]);
    await view.rerender(
      <TestWrapper>
        <ValidationErrorsHarness />
      </TestWrapper>
    );
    await expect.element(indicator).not.toBeInTheDocument();
    saveDraft.mockResolvedValueOnce({ status: "saved" as const });
    await page.getByRole("button", { name: "Save draft" }).click();
    expect(saveDraft).toHaveBeenCalledTimes(2);
  });

  it.each(["edit", "edit/translate", "preview"])(
    "links blocked saves from %s to the editor summary",
    async (route) => {
      pathname = `/en/form-builder/test-form-id/${route}`;
      validationProblems.mockReturnValue([
        {
          path: "elements.0.properties.choices",
          name: "uniqueItems",
          message: "Duplicate choices",
        },
      ]);
      saveDraft.mockResolvedValueOnce({ status: "validation-error" as const });

      await render(<SaveButtonHarness />);
      await waitForSaveAvailability();
      await page.getByRole("button", { name: "Save draft" }).click();

      expect(setShowValidationErrors).toHaveBeenCalledWith(true);
      const indicator = page.getByRole("link", { name: "Not saved - Fix errors" });
      await expect.element(indicator).toBeVisible();
      await expect
        .element(indicator)
        .toHaveAttribute("href", "/en/form-builder/test-form-id/edit#template-validation-errors");
      await expect
        .element(page.getByText("Saving failed - Contact support"))
        .not.toBeInTheDocument();
    }
  );

  it("replaces 0000 in the URL after a successful save when a real form id is returned", async () => {
    pathname = "/en/form-builder/0000/translate";
    saveDraft.mockResolvedValueOnce({ status: "saved" as const, formId: "real-form-id" });

    await render(<SaveButtonHarness />);
    await waitForSaveAvailability();

    await page.getByRole("button", { name: "Save draft" }).click();

    expect(replace).toHaveBeenCalledWith("/en/form-builder/real-form-id/translate");
  });
});

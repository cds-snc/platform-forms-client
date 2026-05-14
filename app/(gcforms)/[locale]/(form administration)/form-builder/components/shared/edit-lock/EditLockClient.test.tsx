/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { EditLockClient } from "./EditLockClient";

const { toastSuccess } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
}));

vi.mock("@formBuilder/components/shared/Toast", () => ({
  toast: {
    success: toastSuccess,
  },
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockState = vi.hoisted(() => ({
  store: {
    lang: "en",
    isPublished: false,
  },
  editLockContext: {
    takeover: vi.fn().mockResolvedValue(undefined),
    getIsActiveTab: vi.fn(() => true),
    hasSessionExpired: false,
    isEnabled: true,
  },
  toast: {
    success: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/form-builder/test-form-id/edit",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (selector: (state: typeof mockState.store) => unknown) =>
    selector(mockState.store),
}));

vi.mock(
  "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider",
  () => ({
    useTreeRef: () => ({ headlessTree: { current: { rebuildTree: vi.fn() } } }),
  })
);

vi.mock("./EditLockContext", async () => {
  const actual = await vi.importActual<typeof import("./EditLockContext")>("./EditLockContext");
  return {
    ...actual,
    useEditLockContext: () => mockState.editLockContext,
  };
});

vi.mock("./EditLockBanner", () => ({
  EditLockBanner: ({ takeover }: { takeover: () => Promise<void> }) => (
    <button onClick={takeover}>Take over editing</button>
  ),
}));

vi.mock("./EditLockSessionExpiredOverlay", () => ({
  EditLockSessionExpiredOverlay: () => <div>Session expired</div>,
}));

vi.mock("@formBuilder/components/shared/Toast", () => ({
  toast: mockState.toast,
}));

describe("EditLockClient", () => {
  beforeEach(() => {
    mockState.store.isPublished = false;
    mockState.editLockContext.hasSessionExpired = false;
    mockState.editLockContext.isEnabled = true;
    mockState.toast.success.mockClear();
    mockState.editLockContext.takeover.mockClear();
    sessionStorage.clear();
  });

  it("renders the lock banner on edit paths while the form is unpublished", () => {
    render(
      <EditLockClient formId="test-form-id">
        <div>Child content</div>
      </EditLockClient>
    );

    expect(screen.getByText("Take over editing")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("hides the lock banner once the form is published", () => {
    mockState.store.isPublished = true;

    render(
      <EditLockClient formId="test-form-id">
        <div>Child content</div>
      </EditLockClient>
    );

    expect(screen.queryByText("Take over editing")).not.toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  describe("takeover toast persistence", () => {
    it("shows toast and clears sessionStorage flag when editLockTakeoverSuccess is present on mount", () => {
      sessionStorage.setItem("showToast", "editLockTakeoverSuccess");

      render(
        <EditLockClient formId="test-form-id">
          <div>Child content</div>
        </EditLockClient>
      );

      expect(mockState.toast.success).toHaveBeenCalledWith(
        "You now have the edit lock and the latest saved form has been loaded.",
        "wide"
      );
      expect(sessionStorage.getItem("showToast")).toBeNull();
    });

    it("does not show toast when sessionStorage flag is not present", () => {
      render(
        <EditLockClient formId="test-form-id">
          <div>Child content</div>
        </EditLockClient>
      );

      expect(mockState.toast.success).not.toHaveBeenCalled();
    });

    it("sets sessionStorage flag when reloadOnTakeover is true", async () => {
      // Mock window.location.reload to prevent actual page reload in tests
      const originalReload = window.location.reload;
      const reloadMock = vi.fn();

      // Replace reload method before rendering
      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          reload: reloadMock,
        },
        writable: true,
      });

      render(
        <EditLockClient formId="test-form-id" reloadOnTakeover={true}>
          <div>Child content</div>
        </EditLockClient>
      );

      const takeoverButton = screen.getByText("Take over editing");
      await takeoverButton.click();

      // Wait for async operations
      await vi.waitFor(() => {
        expect(mockState.editLockContext.takeover).toHaveBeenCalled();
      });

      // Verify sessionStorage flag is set before reload
      expect(sessionStorage.getItem("showToast")).toBe("editLockTakeoverSuccess");
      expect(reloadMock).toHaveBeenCalled();

      // Restore original reload
      Object.defineProperty(window, "location", {
        value: {
          ...window.location,
          reload: originalReload,
        },
        writable: true,
      });
    });

    it("shows toast immediately when reloadOnTakeover is false", async () => {
      render(
        <EditLockClient formId="test-form-id" reloadOnTakeover={false}>
          <div>Child content</div>
        </EditLockClient>
      );

      const takeoverButton = screen.getByText("Take over editing");
      await takeoverButton.click();

      // Wait for async operations
      await vi.waitFor(() => {
        expect(mockState.editLockContext.takeover).toHaveBeenCalled();
      });

      expect(mockState.toast.success).toHaveBeenCalledWith(
        "You now have the edit lock and the latest saved form has been loaded.",
        "wide"
      );
      expect(sessionStorage.getItem("showToast")).toBeNull();
    });
  });
});

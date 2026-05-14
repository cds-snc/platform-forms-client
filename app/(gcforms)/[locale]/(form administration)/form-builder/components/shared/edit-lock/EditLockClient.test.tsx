/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { EditLockClient } from "./EditLockClient";

const mockRouter = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
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
  useRouter: () => mockRouter,
}));

vi.mock("@i18n/client", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === "editLock.syncedLatest") {
        return "You now have the edit lock and the latest saved form has been loaded.";
      }
      return key;
    },
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
    mockRouter.refresh.mockClear();
    mockRouter.push.mockClear();
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

  describe("takeover behavior", () => {
    it("shows toast immediately after takeover by default", async () => {
      render(
        <EditLockClient formId="test-form-id">
          <div>Child content</div>
        </EditLockClient>
      );

      const takeoverButton = screen.getByText("Take over editing");
      await takeoverButton.click();

      await vi.waitFor(() => {
        expect(mockState.editLockContext.takeover).toHaveBeenCalled();
      });

      expect(mockState.toast.success).toHaveBeenCalledWith(
        "You now have the edit lock and the latest saved form has been loaded.",
        "wide"
      );
      expect(mockRouter.refresh).not.toHaveBeenCalled();
    });

    it("calls router.refresh() when refreshServerData is true", async () => {
      render(
        <EditLockClient formId="test-form-id" refreshServerData={true}>
          <div>Child content</div>
        </EditLockClient>
      );

      const takeoverButton = screen.getByText("Take over editing");
      await takeoverButton.click();

      await vi.waitFor(() => {
        expect(mockState.editLockContext.takeover).toHaveBeenCalled();
      });

      expect(mockRouter.refresh).toHaveBeenCalled();
      expect(mockState.toast.success).toHaveBeenCalledWith(
        "You now have the edit lock and the latest saved form has been loaded.",
        "wide"
      );
    });

    it("does not call router.refresh() when refreshServerData is false", async () => {
      render(
        <EditLockClient formId="test-form-id" refreshServerData={false}>
          <div>Child content</div>
        </EditLockClient>
      );

      const takeoverButton = screen.getByText("Take over editing");
      await takeoverButton.click();

      await vi.waitFor(() => {
        expect(mockState.editLockContext.takeover).toHaveBeenCalled();
      });

      expect(mockRouter.refresh).not.toHaveBeenCalled();
      expect(mockState.toast.success).toHaveBeenCalledWith(
        "You now have the edit lock and the latest saved form has been loaded.",
        "wide"
      );
    });
  });
});

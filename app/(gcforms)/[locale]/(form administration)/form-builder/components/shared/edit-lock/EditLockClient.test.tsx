/**
 * @vitest-environment jsdom
 */
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditLockClient } from "./EditLockClient";

const { toastSuccess } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
}));

vi.mock("@formBuilder/components/shared/Toast", () => ({
  toast: {
    success: toastSuccess,
  },
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
  EditLockBanner: ({ takeover }: { takeover: () => void }) => (
    <button type="button" onClick={takeover}>
      Take over editing
    </button>
  ),
}));

vi.mock("./EditLockSessionExpiredOverlay", () => ({
  EditLockSessionExpiredOverlay: () => <div>Session expired</div>,
}));

describe("EditLockClient", () => {
  beforeEach(() => {
    mockState.store.isPublished = false;
    mockState.editLockContext.hasSessionExpired = false;
    mockState.editLockContext.isEnabled = true;
    sessionStorage.clear();
    toastSuccess.mockClear();
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

  it("shows a toast and clears the sessionStorage flag on mount when the flag is set", async () => {
    sessionStorage.setItem("showToast", "editLockTakeoverSuccess");

    await act(async () => {
      render(
        <EditLockClient formId="test-form-id">
          <div>Child content</div>
        </EditLockClient>
      );
    });

    expect(toastSuccess).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem("showToast")).toBeNull();
  });

  it("sets the sessionStorage flag and reloads when reloadOnTakeover is true", async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <EditLockClient formId="test-form-id" reloadOnTakeover>
        <div>Child content</div>
      </EditLockClient>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("Take over editing"));

    expect(sessionStorage.getItem("showToast")).toBe("editLockTakeoverSuccess");
    expect(reloadMock).toHaveBeenCalledOnce();
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});

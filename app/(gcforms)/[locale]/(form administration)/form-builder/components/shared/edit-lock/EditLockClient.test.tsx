/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { EditLockClient } from "./EditLockClient";

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
  EditLockBanner: () => <div>Take over editing</div>,
}));

vi.mock("./EditLockSessionExpiredOverlay", () => ({
  EditLockSessionExpiredOverlay: () => <div>Session expired</div>,
}));

describe("EditLockClient", () => {
  beforeEach(() => {
    mockState.store.isPublished = false;
    mockState.editLockContext.hasSessionExpired = false;
    mockState.editLockContext.isEnabled = true;
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
});

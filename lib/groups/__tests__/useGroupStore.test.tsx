/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";

import { GroupStoreProvider, useGroupStore } from "../useGroupStore";
import { TemplateStoreProvider, useTemplateStore } from "../../store/useTemplateStore";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TemplateStoreProvider allowGroupsFlag={true}>
    <GroupStoreProvider>{children}</GroupStoreProvider>
  </TemplateStoreProvider>
);

describe("useGroupStore addGroup", () => {
  it("adds the new page to groupsLayout and bumps changeKey", async () => {
    const { result } = renderHook(
      () => ({
        addGroup: useGroupStore((state) => state.addGroup),
        template: useTemplateStore((state) => ({
          changeKey: state.changeKey,
          setChangeKey: state.setChangeKey,
          groupsLayout: state.form.groupsLayout,
          groups: state.form.groups,
        })),
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    act(() => {
      result.current.template.setChangeKey("before-add-group");
    });

    let newGroupId = "";
    act(() => {
      newGroupId = result.current.addGroup("New page");
    });

    expect(result.current.template.groupsLayout).toContain(newGroupId);
    expect(result.current.template.groups?.[newGroupId]?.name).toBe("New page");
    expect(result.current.template.changeKey).not.toBe("before-add-group");
  });

  it("connects start to the first page in the current layout order after adding a page", async () => {
    const { result } = renderHook(
      () => ({
        addGroup: useGroupStore((state) => state.addGroup),
        template: useTemplateStore((state) => ({
          groups: state.form.groups,
          groupsLayout: state.form.groupsLayout,
          setGroupsLayout: state.setGroupsLayout,
        })),
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    let firstPageId = "";
    let secondPageId = "";

    act(() => {
      firstPageId = result.current.addGroup("Page 1");
      secondPageId = result.current.addGroup("Page 2");
    });

    act(() => {
      // Simulate the tree order changing without relying on raw object key order.
      result.current.template.setGroupsLayout([secondPageId, firstPageId]);
    });

    act(() => {
      result.current.addGroup("Page 3");
    });

    // Start should reconnect to the first page in the current layout order.
    expect(result.current.template.groupsLayout).toEqual([secondPageId, firstPageId, expect.any(String)]);
    expect(result.current.template.groups?.start.nextAction).toBe(secondPageId);
  });
});
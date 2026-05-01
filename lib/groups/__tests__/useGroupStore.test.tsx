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
});
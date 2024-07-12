import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const useUpdateGroupLayout = () => {
  const { environment } = useTreeRef();
  const setGroupsLayout = useTemplateStore((s) => s.setGroupsLayout);

  const updateGroupsLayout = async () => {
    // Add a delay to ensure the tree from previous actions updates before this is called
    sleep(3000);

    const rootItems = environment?.current?.items.root.children as string[];

    if (rootItems) {
      setGroupsLayout(
        rootItems.filter((item) => item !== "start" && item !== "review" && item !== "end")
      );
    }
  };

  return { updateGroupsLayout };
};

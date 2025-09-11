import { useCallback } from "react";

import { TreeItemData, TreeItemInstance } from "../types";

import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";

export const useScrollIntoView = () => {
  const { refs } = useRefsContext();
  const handleScroll = useCallback(
    (item: TreeItemInstance<TreeItemData>) => {
      let id = item.getId();

      if (id === "confirmation") {
        id = "end";
      }

      // Special elements
      if (id === "intro" || id === "policy" || id === "end") {
        setTimeout(() => {
          // use dom to scroll to the element
          const el = document.getElementById(id);
          if (el) {
            (el as HTMLDetailsElement).open = true;
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);

        return;
      }

      // Elements --- use refs to scroll to the element
      if (refs && refs.current) {
        const el = refs?.current?.[Number(id)];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    },
    [refs]
  );

  return handleScroll;
};

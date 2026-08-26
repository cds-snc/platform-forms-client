import { use } from "react";
import { useTemplateStore, TemplateStoreContext } from "../useTemplateStore";

export const useRehydrate = () => {
  const store = use(TemplateStoreContext);
  const hasHydrated = useTemplateStore((s) => s.hasHydrated);

  if (!store) throw new Error("Missing Template Store Provider in tree");

  return hasHydrated;
};

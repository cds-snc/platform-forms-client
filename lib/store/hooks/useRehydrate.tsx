import { useEffect, use } from "react";
import { useTemplateStore, TemplateStoreContext } from "../useTemplateStore";

export const useRehydrate = () => {
  const store = use(TemplateStoreContext);
  const hasHydrated = useTemplateStore((s) => s.hasHydrated);

  if (!store) throw new Error("Missing Template Store Provider in tree");

  useEffect(() => {
    if (!hasHydrated) {
      store.persist.rehydrate();
    }
  }, [store, hasHydrated]);

  return hasHydrated;
};

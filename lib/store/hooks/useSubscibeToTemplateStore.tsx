import { useEffect, use } from "react";
import { TemplateStoreState } from "../types";
import { TemplateStoreContext } from "../useTemplateStore";
import { shallow } from "zustand/shallow";

export const useSubscibeToTemplateStore = <T,>(
  selector: (state: TemplateStoreState) => T,
  listener: (selectedState: T, previousSelectedState: T) => void
) => {
  const store = use(TemplateStoreContext);
  if (!store) throw new Error("Missing Template Store Provider in tree");
  useEffect(
    () => store.subscribe(selector, listener, { equalityFn: shallow }),
    [store, selector, listener]
  );
};

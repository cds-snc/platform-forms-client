import { LocalizedFormProperties } from "@root/lib/types/form-builder-types";
import { type TemplateStore } from "../../types";

export const getName: TemplateStore<"getName"> =
  (set, get) =>
  (allowFallback = false) => {
    if (!get) {
      throw new Error("get is not defined");
    }

    const title =
      get().form[
        get().localizeField(LocalizedFormProperties.TITLE, get().translationLanguagePriority)
      ];

    if (allowFallback) {
      return get().name || title || "";
    }

    // Default behaviour: return false when no explicit name is set
    return get().name || "";
  };

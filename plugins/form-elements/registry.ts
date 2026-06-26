import type { FormElementTypes } from "@lib/types";
import type { FormElementPlugin } from "./types";

/**
 * Central registry mapping each element type string to its plugin.
 *
 * To register a new element:
 *   import { myElement } from "./myElement";
 *   plugins.set(myElement.type, myElement);
 */
const plugins = new Map<FormElementTypes, FormElementPlugin>();

/**
 * Register a plugin. Called once per element at module load time.
 * Throws if the same type is registered twice (catches typos / duplicates).
 */
export const registerPlugin = (plugin: FormElementPlugin): void => {
  if (plugins.has(plugin.type)) {
    throw new Error(
      `FormElementPlugin: type "${plugin.type}" is already registered. Each type may only have one plugin.`
    );
  }
  plugins.set(plugin.type, plugin);
};

/**
 * Returns the plugin for the given element type, or `null` if no plugin has
 * been registered for it yet.
 *
 * Callers should fall back to legacy switch-case handling when this returns
 * null so that non-migrated elements continue to work during the transition.
 */
export const getPlugin = (type: FormElementTypes): FormElementPlugin | null => {
  return plugins.get(type) ?? null;
};

/**
 * Returns all registered plugins in insertion order.
 * Used by the builder palette to build the element picker list.
 */
export const getAllPlugins = (): FormElementPlugin[] => {
  return Array.from(plugins.values());
};

// ── Plugin registrations ────────────────────────────────────────────────────
// Import each plugin here to auto-register it when this module is first loaded.
import { textFieldPlugin } from "./textField";
import { textAreaPlugin } from "./textArea";
import { richTextPlugin } from "./richText";
import { numberInputPlugin } from "./numberInput";
import { fileInputPlugin } from "./fileInput";
import { radioPlugin } from "./radio";
import { checkboxPlugin } from "./checkbox";
import { dropdownPlugin } from "./dropdown";
import { comboboxPlugin } from "./combobox";
import { formattedDatePlugin } from "./formattedDate";
import { addressCompletePlugin } from "./addressComplete";

registerPlugin(textFieldPlugin);
registerPlugin(textAreaPlugin);
registerPlugin(richTextPlugin);
registerPlugin(numberInputPlugin);
registerPlugin(fileInputPlugin);
registerPlugin(radioPlugin);
registerPlugin(checkboxPlugin);
registerPlugin(dropdownPlugin);
registerPlugin(comboboxPlugin);
registerPlugin(formattedDatePlugin);
registerPlugin(addressCompletePlugin);

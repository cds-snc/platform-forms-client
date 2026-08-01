import { logMessage } from "../logger";
import type { FormElementTypes } from "@lib/types";
import type { FormElementPlugin } from "./types";

const plugins = new Map<FormElementTypes, FormElementPlugin>();

/**
 * Register a plugin. Called once at module load time from each plugin's index.ts.
 * Throws on duplicate registration to catch typos and copy-paste errors early.
 */
export const registerPlugin = (plugin: FormElementPlugin): void => {
  if (plugins.has(plugin.type)) {
    throw new Error(
      `FormElementPlugin: "${plugin.type}" is already registered. Each type may only have one plugin.`
    );
  }
  plugins.set(plugin.type, plugin);
  logMessage.info(`FormElementPlugin: Registered plugin for type "${plugin.type}"`);
};

/**
 * Returns the plugin for the given element type, or null when none is registered.
 * Callers should fall back to the legacy switch-case when this returns null.
 */
export const getPlugin = (type: FormElementTypes): FormElementPlugin | null => {
  return plugins.get(type) ?? null;
};

/**
 * Returns all registered plugins in insertion order.
 * Used by useElementOptions when the pluginArchitecture flag is on.
 */
export const getAllPlugins = (): FormElementPlugin[] => {
  return Array.from(plugins.values());
};

//
// ** Plugin registrations here - add new plugins below **
//

import { textFieldPlugin } from "./textField";
import { textAreaPlugin } from "./textArea";

registerPlugin(textFieldPlugin);
registerPlugin(textAreaPlugin);

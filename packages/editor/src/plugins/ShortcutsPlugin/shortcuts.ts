/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { IS_APPLE } from "@lexical/utils";

//disable eslint sorting rule for quick reference to shortcuts
export const SHORTCUTS = Object.freeze({
  // (Ctrl|⌘) + (Alt|Option) + <key> shortcuts
  NORMAL: IS_APPLE ? "⌘+Opt+0" : "Ctrl+Alt+0",
  HEADING2: IS_APPLE ? "⌘+Opt+2" : "Ctrl+Alt+2",
  HEADING3: IS_APPLE ? "⌘+Opt+3" : "Ctrl+Alt+3",
  BULLET_LIST: IS_APPLE ? "⌘+Opt+4" : "Ctrl+Alt+4",
  NUMBERED_LIST: IS_APPLE ? "⌘+Opt+5" : "Ctrl+Alt+5",

  // (Ctrl|⌘) + Shift + <key> shortcuts
  //

  // (Ctrl|⌘) + <key> shortcuts
  BOLD: IS_APPLE ? "⌘+B" : "Ctrl+B",
  ITALIC: IS_APPLE ? "⌘+I" : "Ctrl+I",
  INSERT_LINK: IS_APPLE ? "⌘+K" : "Ctrl+K",

  // Alt + Shift + <key> shortcuts
  INDENT: "Alt+Shift+→",
  OUTDENT: "Alt+Shift+←",
});

export function controlOrMeta(metaKey: boolean, ctrlKey: boolean): boolean {
  return IS_APPLE ? metaKey : ctrlKey;
}

export function isFormatParagraph(event: KeyboardEvent): boolean {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;

  return (
    (code === "Numpad0" || code === "Digit0") &&
    !shiftKey &&
    altKey &&
    controlOrMeta(metaKey, ctrlKey)
  );
}

export function isFormatHeading(event: KeyboardEvent): boolean {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  const keyNumber = code[code.length - 1];

  return (
    ["1", "2", "3"].includes(keyNumber) && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey)
  );
}

export function isFormatBulletList(event: KeyboardEvent): boolean {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return (
    (code === "Numpad4" || code === "Digit4") &&
    !shiftKey &&
    altKey &&
    controlOrMeta(metaKey, ctrlKey)
  );
}

export function isFormatNumberedList(event: KeyboardEvent): boolean {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return (
    (code === "Numpad5" || code === "Digit5") &&
    !shiftKey &&
    altKey &&
    controlOrMeta(metaKey, ctrlKey)
  );
}

export function isInsertLink(event: KeyboardEvent): boolean {
  const { code, shiftKey, altKey, metaKey, ctrlKey } = event;
  return code === "KeyK" && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey);
}

const isMac = typeof window !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

// Note: Ctrl+Shift+ArrowRight reserved by MacOS so ALT+Shift+ArrowRight is used instead
// Otherwise for all other platforms Ctrl+Shift+ArrowRight is used
export const isIndent = (event: KeyboardEvent) => {
  if (event.key !== "ArrowRight" || !event.shiftKey) return false;
  return isMac ? event.altKey : event.ctrlKey;
};

// Note: Ctrl+Shift+ArrowLeft reserved by MacOS so ALT+Shift+ArrowLeft is used instead
// Otherwise for all other platforms Ctrl+Shift+ArrowLeft is used
export function isOutdent(event: KeyboardEvent): boolean {
  if (event.key !== "ArrowLeft" || !event.shiftKey) return false;
  return isMac ? event.altKey : event.ctrlKey;
}

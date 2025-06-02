/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const SUPPORTED_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);

    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return "about:blank";
    }
  } catch {
    return url.trim();
  }
  return url.trim();
}

const urlRegExp = new RegExp(
  /^(https?:\/\/([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}(\/[^\s]*)?|mailto:[^\s@]+@[^\s@]+\.[^\s@]{2,})$/
);

export function isValidUrl(url: string): boolean {
  return urlRegExp.test(url);
}

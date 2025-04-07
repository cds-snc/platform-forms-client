/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export function sanitizeUrl(url: string): string {
  /** A pattern that matches safe  URLs. */
  const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^&:/?#]*(?:[/?#]|$))/gi;

  /** A pattern that matches safe data URLs. */
  const DATA_URL_PATTERN =
    /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;

  url = String(url).trim();

  if (url.match(SAFE_URL_PATTERN) || url.match(DATA_URL_PATTERN)) return url;

  return url;
}

/**
 * A pattern that matches a valid URL.
 */
const urlRegExp = new RegExp(/^(https?:\/\/)?([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/);
export function isValidUrl(url: string): boolean {
  return urlRegExp.test(url);
}

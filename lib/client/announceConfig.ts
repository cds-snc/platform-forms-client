"use client";

import { configureAnnounce } from "@gcforms/announce";

export const ANNOUNCE_PUBLICATION_INTERVAL_MS = 1000;

if (typeof window !== "undefined") {
  configureAnnounce({ publicationIntervalMs: ANNOUNCE_PUBLICATION_INTERVAL_MS });
}

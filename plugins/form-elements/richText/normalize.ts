import type { Response } from "@lib/types";

/** richText elements have no response value — returns value unchanged. */
export const normalize = (value: Response): Response => value;

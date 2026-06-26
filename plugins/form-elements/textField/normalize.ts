import type { Response } from "@lib/types";

/** textField responses are plain strings — no transformation required. */
export const normalize = (value: Response): Response => value;

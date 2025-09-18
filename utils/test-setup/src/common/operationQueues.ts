import pLimit from "p-limit";

export const gcFormsClientQueue = pLimit(1);

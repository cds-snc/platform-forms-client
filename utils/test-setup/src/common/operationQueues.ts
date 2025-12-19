import pLimit from "p-limit";

export const gcFormsClientQueue = pLimit(1);
export const dynamodbOperationQueue = pLimit(2);

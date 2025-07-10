import pLimit from "p-limit";

export const gcFormsClientQueue = pLimit(1);
export const lambdaClientQueue = pLimit(25);
export const dynamodbClientQueue = pLimit(25);
export const s3ClientQueue = pLimit(25);

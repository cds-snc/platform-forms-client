import { MAX_FILE_SIZE } from "@root/constants";

export const isIndividualFileSizeValid = (size: number): boolean => {
  return size <= MAX_FILE_SIZE;
};

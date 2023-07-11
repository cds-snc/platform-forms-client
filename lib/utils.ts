import { VaultSubmissionAndConfirmationList } from "@lib/types/retrieval-types";

export const chunkArray = (
  arr: NonNullable<VaultSubmissionAndConfirmationList>[] | [],
  size: number
) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

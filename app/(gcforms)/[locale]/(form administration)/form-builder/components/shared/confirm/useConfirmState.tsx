import { useState } from "react";

export type resolveType = (value?: boolean) => void;
export type rejectType = (reason?: string) => void;

export const useConfirmState = () => {
  const [resolve, setResolve] = useState<resolveType | null>(null);
  const [reject, setReject] = useState<rejectType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const getPromise = () => {
    const promise: Promise<boolean> = new Promise((res, rej) => {
      setResolve(() => res);
      setReject(() => rej);
    });

    return promise;
  };

  return { resolve, reject, getPromise, openDialog, setOpenDialog };
};

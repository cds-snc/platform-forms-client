import { useState, useCallback } from "react";

export type resolveType = (value?: boolean) => void;
export type rejectType = (reason?: string) => void;

export const useConfirmState = () => {
  const [resolve, setResolve] = useState<resolveType | null>(null);
  const [reject, setReject] = useState<rejectType | null>(null);

  const getPromise = useCallback(() => {
    const promise: Promise<boolean> = new Promise((res, rej) => {
      setResolve(() => res);
      setReject(() => rej);
    });

    return promise;
  }, [setResolve, setReject]);

  return { resolve, reject, getPromise };
};

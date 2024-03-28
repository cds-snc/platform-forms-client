"use client";
import { checkFlag } from "app/(gcforms)/[locale]/(app administration)/admin/(with nav)/flags/actions";
import { useEffect, useState } from "react";

// TODO probably a beter way to do this.
// There ise use() to call a promise in a hook but it's experimental https://react.dev/reference/react/use
// E.g. const status = use(checkFlag(key));
export const useFlag = (
  key: string
): { isLoading: boolean; status: boolean | undefined; error: string | undefined } => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsLoading(true);

    // TODO if there is no teardown/cleanup function needed in this effect, instead use an async top
    // fn and await instead of a promise. But I think this is against react's BPs.. come back to.
    checkFlag(key)
      .then((status) => {
        setStatus(!!status);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [setIsLoading, setStatus, key]);

  return { isLoading, status, error };
};

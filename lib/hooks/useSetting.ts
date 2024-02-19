"use client";
import { useState, useEffect } from "react";
import { getSetting } from "app/(gcforms)/[locale]/(app administration)/admin/(with nav)/settings/actions";

interface useSettingReturnType {
  isLoading: boolean;
  value?: string | null;
  error: string | undefined;
}

// TODO: this pattern can probably be optimized
export const useSetting = (settingName: string): useSettingReturnType => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [value, setValue] = useState<string | null>();
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsLoading(true);

    getSetting(settingName)
      .then((setting) => {
        setValue(setting);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [settingName]);

  return { isLoading, value, error };
};

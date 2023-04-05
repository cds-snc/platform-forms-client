import { useState, useEffect } from "react";
import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then((response) => response.data);

interface useSettingReturnType {
  isLoading: boolean;
  value?: string;
}

export const useSetting = (settingName: string): useSettingReturnType => {
  const [value, setValue] = useState<string | undefined>();

  const { data, isLoading } = useSWR(`/api/settings/${settingName}`, fetcher);

  useEffect(() => {
    if (!isLoading) {
      setValue(data?.setting);
    }
  }, [isLoading, data, setValue]);

  return { isLoading, value };
};

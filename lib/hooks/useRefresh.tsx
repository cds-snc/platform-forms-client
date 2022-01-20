import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export const useRefresh = (
  data: unknown[] | undefined
): { refreshData: () => Promise<void>; isRefreshing: boolean } => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    await router.replace(router.asPath);
  };

  useEffect(() => {
    setIsRefreshing(false);
  }, data);

  return { refreshData, isRefreshing };
};

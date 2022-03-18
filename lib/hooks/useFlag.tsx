import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

export const useFlag = (key: string): boolean => {
  const { data } = useSWR(`/api/flags/${key}/check`, fetcher);
  return !!data?.status;
};

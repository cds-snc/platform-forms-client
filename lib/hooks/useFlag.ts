import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then((response) => response.data);

export const useFlag = (key: string): boolean => {
  const { data } = useSWR(`/api/flags/${key}/check`, fetcher);
  return !!data?.status;
};

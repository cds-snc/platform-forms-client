import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then((response) => response.data);

export const useLoadFlag = (key: string): [boolean, boolean] => {
  const { data, isLoading } = useSWR(`/api/flags/${key}/check`, fetcher);
  return [isLoading, !!data?.status];
};

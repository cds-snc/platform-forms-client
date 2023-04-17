import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then((response) => response.data);

export const useFlag = (key: string): { isLoading: boolean; status: boolean | undefined } => {
  const { data, isLoading } = useSWR(`/api/flags/${key}/check`, fetcher);
  return { isLoading, status: !!data?.status };
};

import axios, { AxiosError, AxiosResponse } from "axios";

export const useDeleteForm = () => {
  const handleDelete = async (formID?: string): Promise<AxiosResponse | { error: AxiosError }> => {
    try {
      const result = await axios({
        url: `/api/templates/${formID}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      return result as AxiosResponse;
    } catch (err) {
      return { error: err as AxiosError };
    }
  };

  return { handleDelete };
};

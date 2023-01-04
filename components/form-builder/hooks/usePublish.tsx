import axios, { AxiosError } from "axios";

export const usePublish = () => {
  const uploadJson = async (jsonConfig: string, formID?: string, publish = false) => {
    let formData;
    try {
      formData = JSON.parse(jsonConfig);
    } catch (e) {
      if (e instanceof SyntaxError) {
        return { error: new Error("failed to parse form data") };
      }
    }

    try {
      const result = await axios({
        url: "/api/templates",
        method: formID ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          isPublished: publish ? true : false,
          formID: formID,
          formConfig: formData,
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      if (publish && formID) {
        await axios({
          url: "/api/templates",
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            isPublished: true,
            formID: formID,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });
      }

      return { id: result?.data?.id };
    } catch (err) {
      return { error: err as AxiosError };
    }
  };

  return { uploadJson };
};

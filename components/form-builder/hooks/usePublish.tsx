import { DeliveryOption } from "@lib/types";
import axios, { AxiosError, AxiosResponse } from "axios";

export const usePublish = () => {
  const updateResponseDelivery = async (
    formID: string
  ): Promise<AxiosResponse | { error: AxiosError } | undefined> => {
    if (!formID) {
      return;
    }

    try {
      const url = `/api/templates/${formID}`;

      const result = await axios({
        url: url,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          sendResponsesToVault: true,
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      return result.data;
    } catch (err) {
      return { error: err as AxiosError };
    }
  };

  const uploadJson = async (
    jsonConfig: string,
    name?: string,
    deliveryOption?: DeliveryOption,
    formID?: string,
    publish = false
  ) => {
    let formData;
    try {
      formData = JSON.parse(jsonConfig);
    } catch (e) {
      if (e instanceof SyntaxError) {
        return { error: new Error("failed to parse form data") };
      }
    }

    try {
      const url = formID ? `/api/templates/${formID}` : "/api/templates";

      const byEmail = true;
      let data = {};
      if (byEmail) {
        data = { deliveryOption };
      }

      const result = await axios({
        url: url,
        method: formID ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          isPublished: publish ? true : false,
          formConfig: formData,
          name: name,
          ...data,
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      // PUT request with a { formID, isPublished } payload will update the Form Template isPublished property
      if (publish && formID) {
        await axios({
          url: url,
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            isPublished: true,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });
      }

      return { id: result?.data?.id };
    } catch (err) {
      return { error: err as AxiosError };
    }
  };

  return { uploadJson, updateResponseDelivery };
};

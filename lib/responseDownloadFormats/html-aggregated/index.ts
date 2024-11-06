import { FormResponseSubmissions } from "../types";
import { ResponseHtmlAggregated } from "./components/ResponseHTMLAggregated";
import { getOrigin } from "@lib/origin";

// TODO add language param to API call probably as a query or from header info
export const transform = async (formResponseSubmissions: FormResponseSubmissions, lang = "en") => {
  const host = await getOrigin();
  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;
  const response = renderToStaticMarkup(
    ResponseHtmlAggregated({
      lang,
      formResponseSubmissions,
      host,
    })
  );

  return response;
};

import { type FormResponseSubmissions } from "../types";
import { ResponseHtmlAggregated } from "./components/ResponseHTMLAggregated";
import { getOrigin } from "@lib/origin";

// TODO add language param to API call probably as a query or from header info
export const transform = async (formResponseSubmissions: FormResponseSubmissions, lang = "en") => {
  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;
  const HOST = await getOrigin();

  const response = renderToStaticMarkup(
    ResponseHtmlAggregated({
      lang,
      formResponseSubmissions,
      host: HOST,
    })
  );

  return response;
};

import { FormResponseSubmissions } from "../types";
import { ResponseHtmlAggregated } from "./components/ResponseHTMLAggregated";

// TODO add language param to API call probably as a query or from header info
export const transform = async (formResponseSubmissions: FormResponseSubmissions, lang = "en") => {
  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;
  const response = renderToStaticMarkup(
    ResponseHtmlAggregated({
      lang,
      formResponseSubmissions,
    })
  );

  return response;
};

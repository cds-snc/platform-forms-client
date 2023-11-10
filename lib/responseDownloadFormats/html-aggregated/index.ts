import { renderToStaticMarkup } from "react-dom/server";
import { FormResponseSubmissions } from "../types";
import { ResponseHtmlAggregated } from "../html/components/ResponseHTMLAggregated";

// TODO add language param to API call probably as a query or from header info
export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const response = renderToStaticMarkup(
    ResponseHtmlAggregated({
      lang: "en",
      formResponseSubmissions,
    })
  );

  return response;
};

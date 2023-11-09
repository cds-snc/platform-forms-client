import { renderToStaticMarkup } from "react-dom/server";
import { FormResponseSubmissions } from "../types";
import { ResponseHtmlAggregated } from "../html/components/ResponseHTMLAggregated";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const response = renderToStaticMarkup(
    ResponseHtmlAggregated({
      lang: "en",
      formResponseSubmissions,
    })
  );

  return response;
};

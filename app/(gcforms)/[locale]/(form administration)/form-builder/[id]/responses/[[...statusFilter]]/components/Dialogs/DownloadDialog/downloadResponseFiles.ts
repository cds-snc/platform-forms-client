/*--------------------------------------------*
 * Internal Aliases
 *--------------------------------------------*/
import {
  DownloadFormat,
  type CSVResponse,
  type JSONResponse,
} from "@lib/responseDownloadFormats/types";

/*--------------------------------------------*
 * Local Relative
 *--------------------------------------------*/
import type {
  ArchiveAdapter,
  DownloadFile,
  ResponseFileConfig,
  SimpleDownloadFormat,
} from "./DownloadDialog.types";

const isCSVResponse = (response: CSVResponse | JSONResponse): response is CSVResponse =>
  typeof response.responses === "string";

// Update this list when the API adds another format supported by the dialog.
export const availableDownloadFormats: DownloadFormat[] = [
  DownloadFormat.CSV,
  DownloadFormat.JSON,
  DownloadFormat.HTML_ZIPPED,
];

const responseFileConfig = {
  [DownloadFormat.CSV]: {
    name: "responses-reponses.csv",
    content: (response: CSVResponse) => `\uFEFF${response.responses}`,
    contentType: "text/csv;charset=utf-8",
  },
  [DownloadFormat.JSON]: {
    name: "responses-reponses.json",
    content: (response: JSONResponse) => JSON.stringify(response.responses),
    contentType: "application/json",
  },
} satisfies ResponseFileConfig;

export const createIndividualResponseFiles = (
  format: SimpleDownloadFormat,
  response: CSVResponse | JSONResponse,
  filePrefix: string
): DownloadFile[] => {
  let responseFile: DownloadFile;

  if (format === DownloadFormat.CSV) {
    if (!isCSVResponse(response)) {
      throw new TypeError("Expected CSV response data");
    }
    const config = responseFileConfig[DownloadFormat.CSV];
    responseFile = {
      name: `${filePrefix}${config.name}`,
      content: config.content(response),
      contentType: config.contentType,
    };
  } else {
    if (isCSVResponse(response)) {
      throw new TypeError("Expected JSON response data");
    }
    const config = responseFileConfig[DownloadFormat.JSON];
    responseFile = {
      name: `${filePrefix}${config.name}`,
      content: config.content(response),
      contentType: config.contentType,
    };
  }

  return [{ name: `${filePrefix}receipt-recu.html`, content: response.receipt }, responseFile];
};

export const csvArchiveAdapter: ArchiveAdapter<string> = {
  responseFileName: "responses-reponses.csv",
  initialize: (response) => (response as CSVResponse).responses,
  append: (current, response) => current + (response as CSVResponse).responses,
  serialize: (content) => `\uFEFF${content}`,
};

export const jsonArchiveAdapter: ArchiveAdapter<object[]> = {
  responseFileName: "responses-reponses.json",
  initialize: () => [],
  append: (current, response) => {
    const responses = (response as JSONResponse).responses;
    return Array.isArray(responses) ? [...current, ...responses] : current;
  },
  serialize: JSON.stringify,
};

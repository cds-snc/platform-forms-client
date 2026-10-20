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

// Update this list when the API adds another format supported by the dialog.
export const availableDownloadFormats: DownloadFormat[] = [
  DownloadFormat.CSV,
  DownloadFormat.JSON,
  DownloadFormat.HTML_ZIPPED,
];

const responseFileConfig = {
  [DownloadFormat.CSV]: {
    name: "responses-reponses.csv",
    content: (response: CSVResponse | JSONResponse) =>
      `\uFEFF${(response as CSVResponse).responses}`,
    contentType: undefined,
  },
  [DownloadFormat.JSON]: {
    name: "responses-reponses.json",
    content: (response: CSVResponse | JSONResponse) =>
      JSON.stringify((response as JSONResponse).responses),
    contentType: "application/json",
  },
} satisfies ResponseFileConfig;

export const createIndividualResponseFiles = (
  format: SimpleDownloadFormat,
  response: CSVResponse | JSONResponse,
  filePrefix: string
): DownloadFile[] => {
  const responseFile = responseFileConfig[format];

  return [
    { name: `${filePrefix}receipt-recu.html`, content: response.receipt },
    {
      name: `${filePrefix}${responseFile.name}`,
      content: responseFile.content(response),
      contentType: responseFile.contentType,
    },
  ];
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

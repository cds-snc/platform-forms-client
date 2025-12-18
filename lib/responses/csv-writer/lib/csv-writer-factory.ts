import { BrowserCsvWriter } from "./browser-csv-writer";
import { CsvStringifierFactory } from "./csv-stringifier-factory";
import { ObjectStringifierHeader } from "./record";
import { FileSystemFileHandle } from "./browser-types";

export interface ArrayCsvWriterParams {
  fileHandle: FileSystemFileHandle;
  header?: string[];
  fieldDelimiter?: string;
  recordDelimiter?: string;
  alwaysQuote?: boolean;
  append?: boolean;
}

export interface ObjectCsvWriterParams {
  fileHandle: FileSystemFileHandle;
  header: ObjectStringifierHeader;
  fieldDelimiter?: string;
  recordDelimiter?: string;
  headerIdDelimiter?: string;
  alwaysQuote?: boolean;
  append?: boolean;
}

export class CsvWriterFactory {
  constructor(private readonly csvStringifierFactory: CsvStringifierFactory) {}

  createArrayCsvWriter(params: ArrayCsvWriterParams) {
    const csvStringifier = this.csvStringifierFactory.createArrayCsvStringifier({
      header: params.header,
      fieldDelimiter: params.fieldDelimiter,
      recordDelimiter: params.recordDelimiter,
      alwaysQuote: params.alwaysQuote,
    });
    return new BrowserCsvWriter(csvStringifier, params.fileHandle, params.append);
  }

  createObjectCsvWriter(params: ObjectCsvWriterParams) {
    const csvStringifier = this.csvStringifierFactory.createObjectCsvStringifier({
      header: params.header,
      fieldDelimiter: params.fieldDelimiter,
      recordDelimiter: params.recordDelimiter,
      headerIdDelimiter: params.headerIdDelimiter,
      alwaysQuote: params.alwaysQuote,
    });
    return new BrowserCsvWriter(csvStringifier, params.fileHandle, params.append);
  }
}

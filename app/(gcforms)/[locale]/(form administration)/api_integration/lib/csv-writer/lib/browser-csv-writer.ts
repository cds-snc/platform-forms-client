import { CsvStringifier } from "./csv-stringifiers/abstract";
import { BrowserFileWriter } from "./browser-file-writer";
import { FileSystemFileHandle } from "./browser-types";

const DEFAULT_INITIAL_APPEND_FLAG = false;

export class BrowserCsvWriter<T> {
  private readonly fileWriter: BrowserFileWriter;

  constructor(
    private readonly csvStringifier: CsvStringifier<T>,
    fileHandle: FileSystemFileHandle,
    private append = DEFAULT_INITIAL_APPEND_FLAG
  ) {
    this.fileWriter = new BrowserFileWriter(fileHandle, this.append);
  }

  async writeRecords(records: T[]): Promise<void> {
    const recordsString = this.csvStringifier.stringifyRecords(records);
    const writeString = this.headerString + recordsString;
    await this.fileWriter.write(writeString);
    this.append = true;
  }

  private get headerString(): string {
    const headerString = !this.append && this.csvStringifier.getHeaderString();
    return headerString || "";
  }
}

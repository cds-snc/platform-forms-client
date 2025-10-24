import { FileSystemFileHandle } from "./browser-types";

export class BrowserFileWriter {
  private append: boolean;
  private existingContent: string = "";

  constructor(
    private readonly fileHandle: FileSystemFileHandle,
    append: boolean = false
  ) {
    this.append = append;
  }

  async write(string: string): Promise<void> {
    // If appending and it's the first write, read existing content
    if (this.append && this.existingContent === "") {
      try {
        const file = await this.fileHandle.getFile();
        this.existingContent = await file.text();
      } catch (error) {
        // File might not exist yet, that's fine
        this.existingContent = "";
      }
    }

    // Create writable stream
    const writable = await this.fileHandle.createWritable();

    try {
      if (this.append) {
        // Write existing content first, then new content
        await writable.write(this.existingContent + string);
        this.existingContent += string;
      } else {
        // Overwrite the file
        await writable.write(string);
        this.existingContent = string;
      }
    } finally {
      await writable.close();
    }

    this.append = true;
  }
}

class InMemoryFile {
  name: string;
  content: string;
  constructor(name: string, content = "") {
    this.name = name;
    this.content = content;
  }
  async text() {
    return this.content;
  }
}

class InMemoryWritable extends WritableStream {
  private file: InMemoryFile;
  private keepExisting: boolean;
  private firstWrite: boolean = true;

  constructor(file: InMemoryFile, keepExisting = false) {
    const decoder = new TextDecoder();
    let firstWrite = true;

    super({
      write(chunk) {
        const text = typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
        if (keepExisting || !firstWrite) {
          file.content += text;
        } else {
          file.content = text;
        }
        firstWrite = false;
      },
      close() {
        // No-op for in-memory
      },
      abort() {
        // No-op for in-memory
      },
    });

    this.file = file;
    this.keepExisting = keepExisting;
  }

  // Legacy API for compatibility with code that calls write() directly
  async write(data: string | Uint8Array) {
    const writer = this.getWriter();
    await writer.write(data);
    writer.releaseLock();
  }

  async seek(_pos: number) {
    // No-op for in-memory
  }

  async close() {
    const writer = this.getWriter();
    await writer.close();
  }

  async abort() {
    const writer = this.getWriter();
    await writer.abort();
  }
}

class InMemoryFileHandle {
  file: InMemoryFile;
  constructor(name: string) {
    this.file = new InMemoryFile(name);
  }
  async createWritable(options?: { keepExistingData?: boolean }) {
    return new InMemoryWritable(this.file, options?.keepExistingData || false);
  }
  async getFile() {
    return this.file;
  }
  get name() {
    return this.file.name;
  }
}

export class InMemoryDirectoryHandle {
  files: Map<string, InMemoryFileHandle> = new Map();
  async getFileHandle(name: string, options?: { create?: boolean }) {
    const existing = this.files.get(name);
    if (existing) return existing;
    if (options?.create) {
      const fh = new InMemoryFileHandle(name);
      this.files.set(name, fh);
      return fh;
    }
    throw new Error(`File not found: ${name}`);
  }
  async getDirectoryHandle(name: string, options?: { create?: boolean }) {
    // return a nested directory handle backed by same map
    const existing = this.files.get(name);
    if (existing) return existing as unknown as InMemoryDirectoryHandle;
    if (options?.create) {
      const dir = new InMemoryDirectoryHandle();
      this.files.set(name, dir as unknown as InMemoryFileHandle);
      return dir;
    }
    throw new Error(`Directory not found: ${name}`);
  }
  async removeEntry(name: string) {
    this.files.delete(name);
  }
}

export default InMemoryDirectoryHandle;

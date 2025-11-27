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

class InMemoryWritable {
  private file: InMemoryFile;
  private keepExisting: boolean;
  constructor(file: InMemoryFile, keepExisting = false) {
    this.file = file;
    this.keepExisting = keepExisting;
  }
  async write(data: string) {
    if (this.keepExisting) {
      this.file.content = this.file.content + data;
    } else {
      this.file.content = data;
    }
  }
  async seek(_pos: number) {}
  async close() {}
  async abort() {}
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
    throw new Error("File not found");
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
    throw new Error("Directory not found");
  }
  async removeEntry(name: string) {
    this.files.delete(name);
  }
}

export default InMemoryDirectoryHandle;

// Type definitions for File System API
// Based on https://developer.mozilla.org/en-US/docs/Web/API/File_System_API

export interface FileSystemWritableFileStream {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

export interface BrowserFile {
  text(): Promise<string>;
}

export interface FileSystemFileHandle {
  readonly kind: "file";
  readonly name: string;
  getFile(): Promise<BrowserFile>;
  createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
}

export interface FileSystemDirectoryHandle {
  readonly kind: "directory";
  readonly name: string;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

export type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle;

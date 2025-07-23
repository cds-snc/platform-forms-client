import { FileInputResponse } from "@lib/types";

export interface FileInput extends FileInputResponse {
  name: string;
  size: number;
  content: ArrayBuffer;
}

export class MissingFormDataError extends Error {
  constructor(message?: string) {
    super(message ?? "MissingFormDataError");
    Object.setPrototypeOf(this, MissingFormDataError.prototype);
  }
}
export class FormNotFoundError extends Error {
  constructor(message?: string) {
    super(message ?? "FormNotFoundError");
    Object.setPrototypeOf(this, FormNotFoundError.prototype);
  }
}
export class FormIsClosedError extends Error {
  constructor(message?: string) {
    super(message ?? "FormIsClosedError");
    Object.setPrototypeOf(this, FormIsClosedError.prototype);
  }
}
export class FileSizeError extends Error {
  constructor(message?: string) {
    super(message ?? "FileSizeError");
    Object.setPrototypeOf(this, FileSizeError.prototype);
  }
}

export class FileUploadError extends Error {
  public file: FileInput;
  public status?: number;

  constructor(message: string, file: FileInput, status?: number) {
    super(message);
    this.name = "FileUploadError";
    this.file = file;
    this.status = status;
  }
}

export class FileTypeError extends Error {
  constructor(message?: string) {
    super(message ?? "FileTypeError");
    Object.setPrototypeOf(this, FileTypeError.prototype);
  }
}
export class FileObjectInvalid extends Error {
  constructor(message?: string) {
    super(message ?? "FileObjectInvalid");
    Object.setPrototypeOf(this, FileObjectInvalid.prototype);
  }
}
export class SubmissionLambdaInvocationError extends Error {
  constructor(message?: string) {
    super(message ?? "SubmissionLambdaInvocationError");
    Object.setPrototypeOf(this, SubmissionLambdaInvocationError.prototype);
  }
}

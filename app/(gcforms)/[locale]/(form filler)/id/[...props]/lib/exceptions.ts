export class MissingFormIdError extends Error {
  constructor(message?: string) {
    super(message ?? "MissingFormIdError");
    Object.setPrototypeOf(this, MissingFormIdError.prototype);
  }
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
export class SubmissionApiError extends Error {
  constructor(message?: string) {
    super(message ?? "SubmissionApiError");
    Object.setPrototypeOf(this, SubmissionApiError.prototype);
  }
}

export class InvalidFormConfigError extends Error {
  constructor(message?: string) {
    super(message ?? "InvalidFormConfigError");
    Object.setPrototypeOf(this, InvalidFormConfigError.prototype);
  }
}

export class TemplateAlreadyPublishedError extends Error {
  constructor(message?: string) {
    super(message ?? "TemplateAlreadyPublishedError");
    Object.setPrototypeOf(this, TemplateAlreadyPublishedError.prototype);
  }
}

export class TemplateHasUnprocessedSubmissions extends Error {
  constructor(message?: string) {
    super(message ?? "TemplateHasUnprocessedSubmissions");
    Object.setPrototypeOf(this, TemplateHasUnprocessedSubmissions.prototype);
  }
}

import { FormServerErrorCodes } from "@lib/types/form-builder-types";

export class FormBuilderError extends Error {
  code?: FormServerErrorCodes;

  constructor(message?: string, errorCode?: FormServerErrorCodes) {
    super(message);
    this.code = errorCode;
  }
}

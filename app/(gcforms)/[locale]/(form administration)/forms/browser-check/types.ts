export interface TestError {
  error?: string;
  message: string;
}

export type TestResult = true | TestError;

export interface ErrorStates {
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
  error?: string;
}

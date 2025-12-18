/**
 * Custom Error class that supports adding a "cause" for re-throwing errors.
 */
export class ErrorWithCause extends Error {
  cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "ErrorWithCause";
    this.cause = options?.cause;

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorWithCause);
    }
  }
}

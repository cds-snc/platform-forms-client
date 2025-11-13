export class TokenRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenRateLimitError";
  }
}

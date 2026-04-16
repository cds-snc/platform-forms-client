/**
 * Mock for next/server module
 * Used in test environment to avoid server-only module errors
 */

export const headers = () => new Map();
export const cookies = () => ({ get: () => undefined });
export class NextResponse {
  constructor(
    public body: string | null,
    public init?: Record<string, unknown>
  ) {}
  static json(data: unknown) {
    return new NextResponse(JSON.stringify(data));
  }
  static next() {
    return new NextResponse(null);
  }
}
export class NextRequest {
  constructor(public url: string) {}
}

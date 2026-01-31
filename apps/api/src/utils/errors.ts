export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, opts?: { code?: string; details?: unknown }) {
    super(message);
    this.statusCode = statusCode;
    if (opts?.code !== undefined) this.code = opts.code;
    if (opts?.details !== undefined) this.details = opts.details;
  }
}

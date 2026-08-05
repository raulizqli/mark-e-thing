// apps/api/src/shared/errors/app-error.ts

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static notFound(resource: string, id?: string): AppError {
    const message = id
      ? `${resource} with id "${id}" not found`
      : `${resource} not found`;
    return new AppError(404, 'NOT_FOUND', message);
  }
}

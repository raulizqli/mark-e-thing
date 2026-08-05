// src/shared/http/api-response.ts
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    details: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}

export function errorResponse(
  message: string,
  details: unknown = null,
): ApiErrorResponse {
  return {
    success: false,
    error: { message, details },
  };
}

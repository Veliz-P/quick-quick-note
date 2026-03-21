import type { ResultPattern } from "../types/result.pattern";

export function ok<T>(data?: T): ResultPattern<T> {
  return {
    success: true,
    data,
  };
}

export function error<T>(message: string): ResultPattern<T> {
  return {
    success: false,
    error: message,
  };
}

export function handleErrorMsg(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

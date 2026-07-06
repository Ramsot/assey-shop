/**
 * Safely serializes data for React Server Components.
 * Handles BigInt, Date, and other non-serializable types.
 * Use this before passing Prisma data to client components.
 */
export function safeSerialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") {
        return Number(value);
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    })
  );
}

/**
 * Wraps a server action or data fetch with error handling.
 * Returns [data, error] tuple instead of throwing.
 */
export async function tryFetch<T>(
  fn: () => Promise<T>,
  context: string
): Promise<[T | null, Error | null]> {
  try {
    const data = await fn();
    return [data, null];
  } catch (error) {
    const { logServerError } = await import("./error-logger");
    logServerError(context, error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

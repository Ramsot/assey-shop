/**
 * Production-safe error logger for Server Components.
 * Logs errors with digests without leaking sensitive details.
 */
export function logServerError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
) {
  const digest =
    error instanceof Error && "digest" in error
      ? (error as Error & { digest?: string }).digest
      : undefined;

  const safePayload = {
    event: "SERVER_ERROR",
    context,
    digest: digest || "no-digest",
    message: error instanceof Error ? error.message : "Unknown error",
    timestamp: new Date().toISOString(),
    ...(metadata ? { metadata: sanitizeForLogs(metadata) } : {}),
  };

  // In production, this would go to your logging service (Datadog, Sentry, etc.)
  // For now, use console.error with structured JSON
  if (process.env.NODE_ENV === "production") {
    console.error(JSON.stringify(safePayload));
  } else {
    console.error(`[${context}]`, error);
  }

  return digest;
}

/**
 * Strips sensitive keys from metadata before logging.
 */
function sanitizeForLogs(obj: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE_KEYS = [
    "password",
    "passwordHash",
    "token",
    "secret",
    "authorization",
    "cookie",
    "jwt",
  ];

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = "[OBJECT]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

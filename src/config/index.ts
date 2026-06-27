export const config = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN as string | undefined,
} as const;

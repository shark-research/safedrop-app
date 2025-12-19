import { RequestTimeoutException } from '@nestjs/common';

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1] & { timeoutMs?: number };

export async function fetchWithTimeout(
  input: FetchInput,
  options: FetchInit = {},
) {
  const { timeoutMs, ...init } = options;
  const resolvedTimeout =
    Number(timeoutMs ?? process.env.REQUEST_TIMEOUT_MS) || 10000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), resolvedTimeout);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new RequestTimeoutException(
        `Upstream request timed out after ${resolvedTimeout}ms`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

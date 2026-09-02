import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { api } from './api-client';

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: toastError, success: vi.fn() } }));

// The rejected branch of the single response interceptor registered in api-client.
const rejected = (
  api.interceptors.response as unknown as {
    handlers: { rejected: (error: unknown) => Promise<unknown> }[];
  }
).handlers[0].rejected;

const makeError = (status: number, message = 'boom', headers: Record<string, string> = {}) => ({
  response: { status, data: { message }, headers },
});

beforeEach(() => {
  toastError.mockClear();
  useAuthStore.setState({ token: 't', user: null, isAuthenticated: true, hasHydrated: true });
});

describe('api-client response interceptor', () => {
  it('clears auth on 401', async () => {
    await expect(rejected(makeError(401))).rejects.toBeDefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('surfaces the backend message as a toast on 403', async () => {
    await expect(rejected(makeError(403, 'Access denied.'))).rejects.toBeDefined();
    expect(toastError).toHaveBeenCalledWith('Access denied.');
  });

  it('surfaces the backend message as a toast on 500', async () => {
    await expect(rejected(makeError(500, 'A server error occurred.'))).rejects.toBeDefined();
    expect(toastError).toHaveBeenCalledWith('A server error occurred.');
  });

  it('includes the Retry-After seconds in the 429 toast', async () => {
    await expect(rejected(makeError(429, 'slow down', { 'retry-after': '30' }))).rejects.toBeDefined();
    expect(toastError).toHaveBeenCalledWith(expect.stringContaining('30 seconds'));
  });

  it('falls back to a generic 429 message when Retry-After is absent', async () => {
    await expect(rejected(makeError(429))).rejects.toBeDefined();
    expect(toastError).toHaveBeenCalledWith(expect.stringMatching(/too many requests/i));
  });

  it('rejects with the response envelope (data), not the raw axios error', async () => {
    await expect(rejected(makeError(500, 'nope'))).rejects.toMatchObject({ message: 'nope' });
  });

  it('does not toast on 422 — form layers handle field errors', async () => {
    await expect(rejected(makeError(422, 'Validation failed.'))).rejects.toBeDefined();
    expect(toastError).not.toHaveBeenCalled();
  });
});

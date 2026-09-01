import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// happy-dom does not expose a Web Storage implementation in this Node runtime,
// so persisted Zustand stores (auth-storage) have nothing to write to. Provide a
// minimal in-memory shim and reset it between tests.
class MemoryStorage implements Storage {
  #store = new Map<string, string>();
  get length() {
    return this.#store.size;
  }
  clear() {
    this.#store.clear();
  }
  getItem(key: string) {
    return this.#store.get(key) ?? null;
  }
  key(index: number) {
    return [...this.#store.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.#store.delete(key);
  }
  setItem(key: string, value: string) {
    this.#store.set(key, String(value));
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
  });
}

afterEach(() => {
  globalThis.localStorage?.clear();
});

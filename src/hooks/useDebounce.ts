import { useEffect, useState } from 'react';

/**
 * Delays updating the returned value until `delay` ms after the last change
 * to `value`. Used to avoid firing a server request on every keystroke in
 * search inputs feeding a TanStack Query hook.
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};

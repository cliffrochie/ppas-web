import { describe, expect, it } from 'vitest';
import { isApiValidationError } from './index';

describe('isApiValidationError', () => {
  it('narrows a 422-shaped payload with a populated errors record', () => {
    const err = {
      data: null,
      message: 'Validation failed.',
      errors: { email: ['The email field is required.'] },
    };
    expect(isApiValidationError(err)).toBe(true);
  });

  it('rejects a payload whose errors is null', () => {
    expect(isApiValidationError({ data: null, message: 'Server error.', errors: null })).toBe(false);
  });

  it('rejects a plain Error', () => {
    expect(isApiValidationError(new Error('boom'))).toBe(false);
  });

  it('rejects null / undefined / primitives', () => {
    expect(isApiValidationError(null)).toBe(false);
    expect(isApiValidationError(undefined)).toBe(false);
    expect(isApiValidationError('nope')).toBe(false);
  });
});

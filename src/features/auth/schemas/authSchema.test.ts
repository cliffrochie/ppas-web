import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './authSchema';

describe('loginSchema', () => {
  it('accepts a valid email + password', () => {
    const result = loginSchema.safeParse({ email: 'user@nia.test', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@nia.test', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    birthday_month: 'January',
    birthday_day: '15',
    birthday_year: '1990',
    email: 'juan@nia.test',
    password: 'password123',
    password_confirmation: 'password123',
  };

  it('accepts a fully valid payload', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    const result = registerSchema.safeParse({ ...valid, password_confirmation: 'different' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('password_confirmation'))).toBe(true);
    }
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: 'short',
      password_confirmation: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an impossible calendar date (Feb 30)', () => {
    const result = registerSchema.safeParse({
      ...valid,
      birthday_month: 'February',
      birthday_day: '30',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('birthday_day'))).toBe(true);
    }
  });

  it('rejects a day outside 1–31', () => {
    expect(registerSchema.safeParse({ ...valid, birthday_day: '42' }).success).toBe(false);
  });

  it('rejects an unknown month', () => {
    expect(registerSchema.safeParse({ ...valid, birthday_month: 'Smarch' }).success).toBe(false);
  });
});

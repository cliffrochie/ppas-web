import { z } from 'zod';

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Please enter your username or email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export type Month = (typeof MONTHS)[number];

const currentYear = new Date().getFullYear();

export const registerSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    birthday_month: z
      .string()
      .refine((val) => (MONTHS as readonly string[]).includes(val), {
        message: 'Please select a month',
      }),
    birthday_day: z
      .string()
      .min(1, 'Day is required')
      .refine(
        (val) => {
          const n = Number(val);
          return Number.isFinite(n) && Number.isInteger(n) && n >= 1 && n <= 31;
        },
        { message: 'Enter a valid day (1–31)' },
      ),
    birthday_year: z
      .string()
      .min(1, 'Year is required')
      .refine(
        (val) => {
          const n = Number(val);
          return (
            Number.isFinite(n) &&
            Number.isInteger(n) &&
            n >= 1900 &&
            n <= currentYear
          );
        },
        { message: `Enter a valid year (1900–${currentYear})` },
      ),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
  .superRefine((data, ctx) => {
    // Cross-field: verify the day actually exists in the chosen month/year
    const monthIndex = (MONTHS as readonly string[]).indexOf(data.birthday_month);
    const day = parseInt(data.birthday_day, 10);
    const year = parseInt(data.birthday_year, 10);

    if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
      const date = new Date(year, monthIndex, day);
      if (date.getMonth() !== monthIndex || date.getDate() !== day) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid date for the selected month and year',
          path: ['birthday_day'],
        });
      }
    }
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

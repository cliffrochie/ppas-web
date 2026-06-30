import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils';
import { isApiValidationError } from '@/types';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import { useLogin } from '../api/auth';

// ---------------------------------------------------------------------------
// Inline SVG icon for the Google "G" logo
// ---------------------------------------------------------------------------
const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="size-5 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Inline SVG icon for the Apple logo
// ---------------------------------------------------------------------------
const AppleIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="size-5 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91s-2-.89-3.3-.87a4.92 4.92 0 0 0-4.14 2.53C2.61 12.45 4 17.13 5.9 19.71c.95 1.36 2.06 2.88 3.53 2.83s2-.89 3.78-.89 2.26.89 3.8.86 2.48-1.38 3.41-2.75a11 11 0 0 0 1.5-3.17 4.38 4.38 0 0 1-2.46-3.96z" />
  </svg>
);

export const LoginForm = () => {
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(values);
    } catch (error) {
      if (isApiValidationError(error)) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          setError(field as keyof LoginFormData, {
            type: 'server',
            message: messages[0],
          });
        });
      } else {
        setError('root', {
          type: 'server',
          message: 'Unable to sign in. Please check your credentials and try again.',
        });
      }
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={cn(
              'h-10 rounded-lg px-3',
              errors.email && 'border-destructive',
            )}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-destructive text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password field with Forgot password link */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={cn(
                'h-10 rounded-lg px-3 pr-10',
                errors.password && 'border-destructive',
              )}
              {...register('password')}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-destructive text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Root / server error */}
        {errors.root && (
          <p className="text-destructive text-sm" role="alert">
            {errors.root.message}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 w-full rounded-lg bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600/50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* "or" divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-muted-foreground text-sm">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Social sign-in buttons (UI only — OAuth not yet wired) */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          aria-label="Continue with Google"
          className="flex h-10 w-full items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => {
            // TODO: wire up Google OAuth
          }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <button
          type="button"
          aria-label="Continue with Apple"
          className="flex h-10 w-full items-center justify-center gap-3 rounded-lg border border-border bg-muted/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => {
            // TODO: wire up Apple OAuth
          }}
        >
          <AppleIcon />
          Continue with Apple
        </button>
      </div>
    </div>
  );
};

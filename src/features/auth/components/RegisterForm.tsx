import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils';
import { isApiValidationError } from '@/types';
import { registerSchema, MONTHS, type RegisterFormData } from '../schemas/authSchema';
import type { RegisterPayload } from '../types';
import { useRegister } from '../api/auth';

export const RegisterForm = () => {
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      birthday_month: '',
      birthday_day: '',
      birthday_year: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    const monthIndex =
      (MONTHS as readonly string[]).indexOf(values.birthday_month) + 1;
    const day = parseInt(values.birthday_day, 10);
    const year = parseInt(values.birthday_year, 10);

    const payload: RegisterPayload = {
      first_name: values.first_name,
      last_name: values.last_name,
      date_of_birth: `${year}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      email: values.email,
      password: values.password,
      password_confirmation: values.password_confirmation,
    };

    try {
      await registerMutation.mutateAsync(payload);
    } catch (error) {
      if (isApiValidationError(error)) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          // Map the backend date_of_birth error to the birthday_day form field
          const formField = field === 'date_of_birth' ? 'birthday_day' : field;
          setError(formField as keyof RegisterFormData, {
            type: 'server',
            message: messages[0],
          });
        });
      } else {
        setError('root', {
          type: 'server',
          message: 'Registration failed. Please try again.',
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {/* First name / Last name — two columns, placeholder-only (no separate labels) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Input
            id="first_name"
            placeholder="First name"
            autoFocus
            autoComplete="given-name"
            aria-label="First name"
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? 'first-name-error' : undefined}
            className={cn('h-10', errors.first_name && 'border-destructive')}
            {...register('first_name')}
          />
          {errors.first_name && (
            <p id="first-name-error" className="text-destructive text-xs">
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            id="last_name"
            placeholder="Last name"
            autoComplete="family-name"
            aria-label="Last name"
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? 'last-name-error' : undefined}
            className={cn('h-10', errors.last_name && 'border-destructive')}
            {...register('last_name')}
          />
          {errors.last_name && (
            <p id="last-name-error" className="text-destructive text-xs">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      {/* Birthday — month select + day + year */}
      <div className="flex flex-col gap-1.5">
        <Label>Birthday</Label>
        <div className="grid grid-cols-3 gap-2">
          {/* Month — Shadcn Select wired via Controller */}
          <div className="flex flex-col gap-1">
            <Controller
              control={control}
              name="birthday_month"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  name={field.name}
                >
                  <SelectTrigger
                    className={cn(
                      '!h-10 w-full',
                      errors.birthday_month && 'border-destructive',
                    )}
                    aria-invalid={!!errors.birthday_month}
                    aria-label="Birth month"
                  >
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.birthday_month && (
              <p className="text-destructive text-xs">
                {errors.birthday_month.message}
              </p>
            )}
          </div>

          {/* Day */}
          <div className="flex flex-col gap-1">
            <Input
              id="birthday_day"
              type="number"
              placeholder="Day"
              min={1}
              max={31}
              aria-label="Birth day"
              aria-invalid={!!errors.birthday_day}
              aria-describedby={errors.birthday_day ? 'birthday-day-error' : undefined}
              className={cn('h-10', errors.birthday_day && 'border-destructive')}
              {...register('birthday_day')}
            />
            {errors.birthday_day && (
              <p id="birthday-day-error" className="text-destructive text-xs">
                {errors.birthday_day.message}
              </p>
            )}
          </div>

          {/* Year */}
          <div className="flex flex-col gap-1">
            <Input
              id="birthday_year"
              type="number"
              placeholder="Year"
              min={1900}
              max={new Date().getFullYear()}
              aria-label="Birth year"
              aria-invalid={!!errors.birthday_year}
              aria-describedby={errors.birthday_year ? 'birthday-year-error' : undefined}
              className={cn('h-10', errors.birthday_year && 'border-destructive')}
              {...register('birthday_year')}
            />
            {errors.birthday_year && (
              <p id="birthday-year-error" className="text-destructive text-xs">
                {errors.birthday_year.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Email address */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg_email">Email address</Label>
        <Input
          id="reg_email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={cn('h-10', errors.email && 'border-destructive')}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-destructive text-xs">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg_password">Password</Label>
        <div className="relative">
          <Input
            id="reg_password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={cn('h-10 pr-10', errors.password && 'border-destructive')}
            {...register('password')}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((p) => !p)}
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

      {/* Password confirmation */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg_password_confirmation">Password confirmation</Label>
        <div className="relative">
          <Input
            id="reg_password_confirmation"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            aria-invalid={!!errors.password_confirmation}
            aria-describedby={
              errors.password_confirmation ? 'confirm-password-error' : undefined
            }
            className={cn(
              'h-10 pr-10',
              errors.password_confirmation && 'border-destructive',
            )}
            {...register('password_confirmation')}
          />
          <button
            type="button"
            aria-label={
              showConfirmPassword ? 'Hide password' : 'Show password confirmation'
            }
            onClick={() => setShowConfirmPassword((p) => !p)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password_confirmation && (
          <p id="confirm-password-error" className="text-destructive text-xs">
            {errors.password_confirmation.message}
          </p>
        )}
      </div>

      {/* Root / server error */}
      {errors.root && (
        <p className="text-destructive text-sm" role="alert">
          {errors.root.message}
        </p>
      )}

      {/* Submit — centred, not full-width (matches design) */}
      <div className="flex justify-center pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 px-14 text-white hover:bg-green-700 focus-visible:ring-green-600/50"
        >
          {isSubmitting ? 'Creating account...' : 'Sign up'}
        </Button>
      </div>
    </form>
  );
};

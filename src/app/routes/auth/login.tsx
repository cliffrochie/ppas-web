import { Link } from 'react-router-dom';
import ppasLogo from '@/assets/ppas-logo.svg';
import { AuthLayout } from '@/components/layouts';
import { LoginForm } from '@/features/auth';

const LoginPage = () => {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-6">
        {/* PPAS brand logo */}
        <img
          src={ppasLogo}
          alt="PPAS – Procurement Process Automation System"
          className="h-28 w-28"
          draggable={false}
        />

        {/* Page heading */}
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Sign in to PPAS
        </h1>

        {/* Login form + social buttons */}
        <div className="w-full">
          <LoginForm />
        </div>

        {/* Sign-up nudge */}
        <p className="text-muted-foreground text-sm">
          New to PPAS?{' '}
          <Link
            to="/register"
            className="text-blue-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

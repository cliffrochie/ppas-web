import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts';
import { RegisterForm } from '@/features/auth';
import ppasLogo from '@/assets/ppas-logo.svg';

const RegisterPage = () => {
  return (
    <AuthLayout containerClassName="max-w-xl">
      <div className="flex flex-col items-center gap-6">
        {/* PPAS brand logo — above the card */}
        <img
          src={ppasLogo}
          alt="PPAS – Procurement Process Automation System"
          className="h-24 w-24"
          draggable={false}
        />

        {/* Registration card */}
        <div className="w-full rounded-xl border border-border bg-muted/20 px-8 py-8">
          {/* Card heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Create an Account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              It&apos;s quick and easy.
            </p>
          </div>

          {/* Registration form */}
          <RegisterForm />

          {/* Already have an account link — inside the card per design */}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="text-blue-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded"
            >
              Already have an account? Click here.
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;

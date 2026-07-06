import { Link } from 'react-router-dom';

const ForbiddenPage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-foreground text-4xl font-bold">403</h1>
      <p className="text-muted-foreground">
        Access Denied. You do not have permission to view this page.
      </p>
      <Link
        to="/dashboard"
        className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-all"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default ForbiddenPage;

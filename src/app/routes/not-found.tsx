import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-foreground text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-all"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;

import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
    <p className="text-6xl">🍰</p>
    <h1 className="mt-4 font-display text-2xl font-semibold text-berry-500">Page not found</h1>
    <p className="mt-2 text-sm text-mauve-500">
      The page you're looking for doesn't exist.
    </p>
    <Link to="/" className="btn-primary mt-6">
      Back to Home
    </Link>
  </div>
);

export default NotFound;

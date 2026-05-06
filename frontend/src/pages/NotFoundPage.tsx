import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-center px-6">
    <div className="text-6xl font-bold text-white">404</div>
    <p className="text-slate-400 mt-2">This page doesn't exist (yet).</p>
    <Link
      to="/dashboard"
      className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
    >
      Back to dashboard
    </Link>
  </div>
);

export default NotFoundPage;

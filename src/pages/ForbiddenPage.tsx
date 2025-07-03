import { Link } from 'react-router-dom';
import { HiOutlineLockClosed } from 'react-icons/hi';

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <HiOutlineLockClosed className="w-24 h-24 text-red-500 mb-4" />
      <h1 className="text-6xl font-bold text-gray-800">403</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-2">Access Denied</h2>
      <p className="text-base text-gray-500 mb-6">
        Sorry, you do not have the necessary permissions to access this page.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
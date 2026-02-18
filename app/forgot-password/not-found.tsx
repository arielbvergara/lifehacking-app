import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-all"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

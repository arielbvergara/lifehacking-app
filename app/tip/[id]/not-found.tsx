import Link from 'next/link';
import { HomeHeader } from '@/components/layout/home-header';
import { HomeFooter } from '@/components/home/home-footer';

export default function TipNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <HomeHeader user={null} />
      
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Tip Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The tip you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
      
      <HomeFooter />
    </div>
  );
}

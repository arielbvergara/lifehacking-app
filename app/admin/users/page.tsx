import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { UsersManagementClient } from '@/components/admin/users/users-management-client';

/**
 * Users Management Page
 * 
 * Server component wrapper for the admin users management page.
 * Includes Header, Footer, Breadcrumb, page heading, and "Create New User" button.
 * The UsersManagementClient component handles search, table, and pagination.
 */
export const metadata: Metadata = {
  title: 'Manage Users | Admin',
  description: 'View, search, and delete users',
};

export default function UsersManagementPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Users' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Users
            </h1>
            <p className="text-gray-600">
              View, search, and delete users
            </p>
          </div>
          <Link
            href="/admin/users/create"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-center whitespace-nowrap"
          >
            Create New User
          </Link>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        }>
          <UsersManagementClient />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}

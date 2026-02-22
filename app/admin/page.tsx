import { Suspense } from 'react';
import { Metadata } from 'next';
import { DashboardClient } from '@/components/admin/dashboard/dashboard-client';

/**
 * Admin Dashboard Page
 * 
 * Server component wrapper for the admin dashboard page.
 * The DashboardClient component handles the complete page layout including
 * Header, Footer, Breadcrumb, and dashboard statistics display.
 */
export const metadata: Metadata = {
  title: 'Admin Dashboard | Lifehacking',
  description: 'View system statistics and manage content',
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}

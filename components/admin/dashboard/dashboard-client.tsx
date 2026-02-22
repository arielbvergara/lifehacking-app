'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchDashboardStatistics } from '@/lib/api/admin-dashboard';
import { DashboardGrid } from './dashboard-grid';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import type { DashboardResponse } from '@/lib/types/admin-dashboard';

/**
 * Dashboard Client Component
 * 
 * Manages the client-side state for the admin dashboard.
 * Fetches statistics on mount and handles loading, error, and retry states.
 * Includes the complete page layout with Header, Footer, and Breadcrumb.
 */
export function DashboardClient() {
  const { user, idToken } = useAuth();
  const [statistics, setStatistics] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load dashboard statistics from API
   * Handles loading state, error state, and data updates
   */
  const loadStatistics = async () => {
    if (!user || !idToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchDashboardStatistics(idToken);
      setStatistics(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics on mount when user is authenticated
  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, idToken]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Admin' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor system health and manage content
          </p>
        </div>

        <DashboardGrid
          statistics={statistics}
          loading={loading}
          error={error}
          onRetry={loadStatistics}
        />
      </main>
      
      <Footer />
    </div>
  );
}

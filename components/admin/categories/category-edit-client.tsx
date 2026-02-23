'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchCategoryById } from '@/lib/api/admin-category';
import { CategoryForm } from '@/components/admin/category-form';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import type { CategoryResponse } from '@/lib/types/admin-category';

interface CategoryEditClientProps {
  categoryId: string;
}

/**
 * CategoryEditClient Component
 * 
 * Client-side component for editing an existing category.
 * Fetches category data on mount and displays the CategoryForm in edit mode.
 * Handles loading, 404 errors, and other error states gracefully.
 */
export function CategoryEditClient({ categoryId }: CategoryEditClientProps) {
  const router = useRouter();
  const { idToken } = useAuth();
  const [categoryData, setCategoryData] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  /**
   * Load category data from API
   * Handles loading state, error state, and data updates
   */
  const loadCategoryData = async () => {
    if (!idToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchCategoryById(categoryId, idToken);
      setCategoryData(data);
    } catch (err) {
      const apiError = err as { status?: number; message?: string };
      console.error('[CategoryEdit] Failed to load category:', apiError.message);
      setError({
        status: apiError.status,
        message: 'Something went wrong while loading the category. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch category data on mount when user is authenticated
  useEffect(() => {
    loadCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Categories', href: '/admin/categories' },
    { label: 'Edit Category' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Category
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center py-16">
            <svg
              className="animate-spin h-12 w-12 text-primary mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-600">Loading category...</p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // 404 error state
  if (error?.status === 404) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Category
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="mb-4">
              <span className="material-icons-round text-gray-400 text-6xl">
                search_off
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Category not found
            </h3>
            <p className="text-gray-600 mb-6">
              The category you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <button
              onClick={() => router.push('/admin/categories')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Back to Categories
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Other error states
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Category
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="mb-4">
              <span className="material-icons-round text-red-500 text-5xl">
                error_outline
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Category
            </h3>
            <p className="text-gray-600 mb-6">
              Something went wrong while loading the category. Please try again.
            </p>
            <button
              onClick={loadCategoryData}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Retry
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Success state - render the form (only if categoryData is loaded)
  if (!categoryData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Category
          </h1>
          <p className="text-gray-600">
            Update category details
          </p>
        </div>

        <CategoryForm
          mode="edit"
          initialData={categoryData}
          categoryId={categoryId}
        />
      </main>
      
      <Footer />
    </div>
  );
}

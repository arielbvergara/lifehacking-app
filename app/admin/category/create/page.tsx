import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { CategoryForm } from '@/components/admin/category-form';

export const metadata: Metadata = {
  title: 'Create Category | Admin',
  description: 'Create a new category for organizing life hacks',
};

export default function CreateCategoryPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Create category' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Category
          </h1>
          <p className="text-gray-600">
            Add a new category to organize life hacks
          </p>
        </div>

        <CategoryForm />
      </main>
      
      <Footer />
    </div>
  );
}

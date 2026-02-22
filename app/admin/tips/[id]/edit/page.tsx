import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { TipEditClient } from '@/components/admin/tips/tip-edit-client';

export const metadata: Metadata = {
  title: 'Edit Tip | Admin',
  description: 'Edit tip details',
};

export default async function TipEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Tips', href: '/admin/tips' },
    { label: 'Edit' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Tip
          </h1>
          <p className="text-gray-600">
            Update tip details and content
          </p>
        </div>

        <TipEditClient tipId={id} />
      </main>
      
      <Footer />
    </div>
  );
}

import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { TipForm } from '@/components/admin/tip-form';

export const metadata: Metadata = {
  title: 'Create Tip | Admin',
  description: 'Create a new life hack tip with AI-powered content generation',
};

export default function CreateTipPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tips', href: '/tips/latest' },
    { label: 'Create tip' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Tip
          </h1>
          <p className="text-gray-600">
            Generate a new life hack tip from a video URL using AI
          </p>
        </div>

        <TipForm />
      </main>
      
      <Footer />
    </div>
  );
}

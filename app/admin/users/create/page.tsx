import { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { UserForm } from '@/components/admin/users/user-form';

export const metadata: Metadata = {
  title: 'Create User | Admin',
  description: 'Create a new admin user',
};

export default function CreateUserPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Create user' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Admin User
          </h1>
          <p className="text-gray-600">
            Create a new administrator account
          </p>
        </div>

        <UserForm />
      </main>
      
      <Footer />
    </div>
  );
}

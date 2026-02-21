import { Metadata } from 'next';
import { CategoryEditClient } from '@/components/admin/categories/category-edit-client';

export const metadata: Metadata = {
  title: 'Edit Category | Admin',
  description: 'Edit category details',
};

export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryEditClient categoryId={id} />;
}

import { Suspense } from 'react';
import { categories } from '@/data/categories';
import { CategoryView } from '@/components/views/CategoryView';

/** Ids are known at build time, which keeps a static export possible. */
export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CategoryView />
    </Suspense>
  );
}

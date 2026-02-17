import { Metadata } from 'next';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { getCachedTipById } from '@/lib/data/tip-data';
import { generateHowToStructuredData } from '@/lib/seo/structured-data';
import { truncateForBreadcrumb } from '@/lib/utils/text';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { TipHeader } from '@/components/tip/tip-header';
import { TipHero } from '@/components/tip/tip-hero';
import { TipDescription } from '@/components/tip/tip-description';
import { TipSteps } from '@/components/tip/tip-steps';
import { RelatedTips } from '@/components/tip/related-tips';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const tip = await getCachedTipById(id);
    
    const description = tip.description.slice(0, 160);
    const imageUrl = tip.image?.imageUrl || '/default.png';
    const canonicalUrl = `https://lifehackbuddy.com/tip/${tip.id}`;
    
    return {
      title: `${tip.title} - LifeHackBuddy`,
      description,
      keywords: [tip.categoryName, ...tip.tags, 'life hack', 'tip'],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: tip.title,
        description,
        type: 'article',
        url: canonicalUrl,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: tip.title,
          },
        ],
        publishedTime: tip.createdAt,
        modifiedTime: tip.updatedAt || tip.createdAt,
      },
      twitter: {
        card: 'summary_large_image',
        title: tip.title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Tip Not Found - LifeHackBuddy',
      description: 'The tip you are looking for could not be found.',
    };
  }
}

export default async function TipDetailPage({ params }: Props) {
  // Defer to request time to avoid build-time API dependency
  await connection();
  
  // Fetch tip data with caching
  const { id } = await params;
  let tip;
  try {
    tip = await getCachedTipById(id);
  } catch {
    notFound();
  }

  // Generate structured data
  const structuredData = generateHowToStructuredData(tip);

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: tip.categoryName, href: `/category/${tip.categoryId}` },
    { label: truncateForBreadcrumb(tip.title) },
  ];

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Page Layout */}
      <div className="min-h-screen flex flex-col bg-background-light">
        <Header />
        
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Tip Content */}
          <article className="mt-8">
            <TipHeader
              title={tip.title}
              categoryName={tip.categoryName}
              createdAt={tip.createdAt}
            />

            <TipHero
              videoUrl={tip.videoUrl}
              image={tip.image}
              title={tip.title}
            />

            <TipDescription description={tip.description} />

            <TipSteps steps={tip.steps} />
          </article>

          {/* Related Tips */}
          <RelatedTips
            categoryId={tip.categoryId}
            currentTipId={tip.id}
          />
        </main>

        <Footer />
      </div>
    </>
  );
}

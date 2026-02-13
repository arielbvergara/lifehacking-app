import type { Metadata } from 'next';
import { HomePageClient } from './page.client';
import { generateWebsiteStructuredData } from '@/lib/seo/structured-data';

/**
 * Home Page Metadata
 * 
 * SEO-optimized metadata for the main landing page including
 * Open Graph tags, Twitter cards, and canonical URL.
 */
export const metadata: Metadata = {
  title: 'LifeHackBuddy - Simple Life Hacks for Everyday Living',
  description: 'Discover simple tricks for cooking, cleaning, and living better. Browse thousands of practical life hacks organized by category.',
  keywords: ['life hacks', 'tips', 'tricks', 'home organization', 'cooking tips', 'cleaning hacks', 'productivity', 'wellness'],
  alternates: {
    canonical: 'https://lifehackbuddy.com',
  },
  openGraph: {
    title: 'LifeHackBuddy - Simple Life Hacks for Everyday Living',
    description: 'Discover simple tricks for cooking, cleaning, and living better.',
    type: 'website',
    url: 'https://lifehackbuddy.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LifeHackBuddy - Simple Life Hacks for Everyday Living',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeHackBuddy - Simple Life Hacks for Everyday Living',
    description: 'Discover simple tricks for cooking, cleaning, and living better.',
    images: ['/twitter-image.png'],
  },
};

/**
 * Home Page Component (Server Component)
 * 
 * Main landing page displaying:
 * - Hero section with search and category tags
 * - Explore categories grid
 * - Featured tip (most recent)
 * - Latest lifehacks grid
 * 
 * Implements hybrid SSR pattern with client component for interactivity.
 * Includes structured data (JSON-LD) for enhanced SEO.
 */
export default function Home() {
  const structuredData = generateWebsiteStructuredData();

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Client Component with Interactive Features */}
      <HomePageClient />
    </>
  );
}

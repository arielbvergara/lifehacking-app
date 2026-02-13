import { TipSummary } from '@/lib/types/api';

/**
 * SEO Structured Data Utilities
 * 
 * Generates JSON-LD structured data for search engines.
 * Follows Schema.org specifications for rich snippets and enhanced SERP visibility.
 */

export interface WebsiteStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  potentialAction?: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export interface ArticleStructuredData {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  author: {
    '@type': string;
    name: string;
  };
}

/**
 * Generates website-level structured data with search action
 */
export function generateWebsiteStructuredData(baseUrl: string = 'https://lifehackbuddy.com'): WebsiteStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LifeHackBuddy',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates article structured data for a tip
 */
export function generateTipStructuredData(tip: TipSummary, baseUrl: string = 'https://lifehackbuddy.com'): ArticleStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: tip.title,
    description: tip.description,
    image: tip.image?.imageUrl || undefined,
    datePublished: tip.createdAt,
    author: {
      '@type': 'Organization',
      name: 'LifeHackBuddy',
    },
  };
}

/**
 * Converts structured data object to JSON-LD script tag string
 */
export function structuredDataToScript(data: WebsiteStructuredData | ArticleStructuredData): string {
  return JSON.stringify(data);
}

import { TipSummary, TipDetail } from '@/lib/types/api';
import { SITE_URL } from '@/lib/config/site';

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

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbStructuredData {
  '@context': string;
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
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

export interface HowToStructuredData {
  '@context': string;
  '@type': 'HowTo';
  name: string;
  description: string;
  image?: string;
  video?: {
    '@type': 'VideoObject';
    name: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
    uploadDate: string;
  };
  step: Array<{
    '@type': 'HowToStep';
    position: number;
    name: string;
    text: string;
  }>;
  totalTime?: string;
}

/**
 * Generates website-level structured data with search action
 */
export function generateWebsiteStructuredData(baseUrl: string = SITE_URL): WebsiteStructuredData {
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
export function generateTipStructuredData(tip: TipSummary): ArticleStructuredData {
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
  return safeJsonLdStringify(data);
}

/**
 * Safely serializes data for embedding inside a <script> tag.
 *
 * JSON.stringify alone does NOT escape "</script>" sequences, which allows
 * user-controlled content to break out of the script context and inject HTML.
 * This function replaces the dangerous sequence with its escaped equivalent.
 *
 * References:
 * - OWASP A03:2021 Injection (XSS via JSON-LD)
 * - https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Generates BreadcrumbList structured data for a page
 * Follows Schema.org BreadcrumbList specification
 *
 * @param items - Array of breadcrumb items with label and optional href
 * @param baseUrl - Base URL for constructing absolute item URLs
 * @returns BreadcrumbList structured data object ready for JSON-LD embedding
 */
export function generateBreadcrumbStructuredData(
  items: BreadcrumbItem[],
  baseUrl: string = SITE_URL
): BreadcrumbStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const listItem: BreadcrumbStructuredData['itemListElement'][number] = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
      };
      if (item.href) {
        listItem.item = item.href.startsWith('http')
          ? item.href
          : `${baseUrl}${item.href}`;
      }
      return listItem;
    }),
  };
}

/**
 * Generates HowTo structured data for a tip detail page
 * Follows Schema.org HowTo specification for step-by-step instructions
 * 
 * @param tip - The tip detail object containing all tip information
 * @returns HowTo structured data object ready for JSON-LD embedding
 */
export function generateHowToStructuredData(tip: TipDetail): HowToStructuredData {
  const data: HowToStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tip.title,
    description: tip.description,
    image: tip.image?.imageUrl || undefined,
    step: tip.steps.map((step) => ({
      '@type': 'HowToStep',
      position: step.stepNumber,
      name: `Step ${step.stepNumber}`,
      text: step.description,
    })),
  };

  // Add video object if both videoUrl and image are available
  if (tip.videoUrl && tip.image?.imageUrl) {
    data.video = {
      '@type': 'VideoObject',
      name: tip.title,
      description: tip.description,
      thumbnailUrl: tip.image.imageUrl,
      contentUrl: tip.videoUrl,
      uploadDate: tip.createdAt,
    };
  }

  return data;
}

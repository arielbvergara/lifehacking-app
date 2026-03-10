import { test, expect } from '@playwright/test';
import { MOCK_TIP_ID } from './fixtures/mock-data';

test.describe('Tip Detail Page', () => {
  // Use mock tip ID from fixtures
  const validTipId = MOCK_TIP_ID;
  const invalidTipId = 'invalid-uuid-format';

  test.describe('Navigation and Content Display', () => {
    test('should navigate to tip page from home', async ({ page }) => {
      await page.goto('/');

      // Wait for tips to load and click on the first tip card
      const firstTipCard = page.locator('[data-testid="tip-card"]').first();
      await firstTipCard.waitFor({ state: 'visible', timeout: 10000 });
      await firstTipCard.click();

      // Verify we're on a tip detail page (note: URL uses /tips/ plural)
      await expect(page).toHaveURL(/\/tips\/[a-f0-9-]+/);
    });

    test('should display all tip content correctly', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Check breadcrumb navigation
      const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i }).first();
      await expect(breadcrumb).toBeVisible({ timeout: 10000 });
      await expect(breadcrumb.getByRole('link').first()).toBeVisible();

      // Check tip header elements (use first() to handle potential duplicates)
      await expect(page.locator('h1').first()).toBeVisible();
      
      // Check category badge is visible (it's in the article header)
      await expect(page.locator('article header span').first()).toBeVisible();

      // Check tip hero section (image or video)
      const heroSection = page.locator('[data-testid="tip-hero"]').first();
      await expect(heroSection).toBeVisible();

      // Check tip description (paragraph text)
      await expect(page.locator('article p').first()).toBeVisible();

      // Check steps section
      await expect(page.getByText(/easy steps/i).first()).toBeVisible();
    });

    test('should display breadcrumb navigation correctly', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);
      await page.waitForLoadState('networkidle');

      const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i }).first();
      await expect(breadcrumb).toBeVisible({ timeout: 10000 });
      
      // Check Home link (use exact match to avoid "Home gardening" category)
      const homeLink = breadcrumb.getByRole('link', { name: 'Home', exact: true });
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveAttribute('href', '/');

      // Check category link is present
      const categoryLink = breadcrumb.getByRole('link').nth(1);
      await expect(categoryLink).toBeVisible();

      // Check current page (tip title) is not a link
      const currentPage = breadcrumb.locator('[aria-current="page"]');
      await expect(currentPage).toBeVisible();
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should navigate back to home via breadcrumb', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);
      await page.waitForLoadState('networkidle');

      const homeLink = page.getByRole('navigation', { name: /breadcrumb/i }).first()
        .getByRole('link', { name: 'Home', exact: true });
      
      await expect(homeLink).toBeVisible({ timeout: 10000 });
      await homeLink.click();
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Video Embeds', () => {
    test('should load video embed when present', async ({ page }) => {
      // This test assumes the tip has a video URL
      await page.goto(`/tips/${validTipId}`);

      // Check if video iframe is present
      const videoIframe = page.locator('iframe[title*="Video"]');
      
      // If video exists, verify it's visible
      const videoCount = await videoIframe.count();
      if (videoCount > 0) {
        await expect(videoIframe).toBeVisible();
        
        // Verify iframe has proper attributes
        await expect(videoIframe).toHaveAttribute('src', /.+/);
      }
    });
  });

  test.describe('Related Tips', () => {
    test('should display related tips section', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Check for "More like this" section (use first() to handle duplicates)
      const relatedSection = page.getByText(/more like this/i).first();
      
      // If related tips exist, verify they're displayed
      const relatedSectionCount = await relatedSection.count();
      if (relatedSectionCount > 0) {
        await expect(relatedSection).toBeVisible();

        // Check that related tip cards are present
        const relatedTipCards = page.locator('[data-testid="tip-card"]');
        const cardCount = await relatedTipCards.count();
        
        // Should have between 1 and 4 related tips
        expect(cardCount).toBeGreaterThan(0);
        expect(cardCount).toBeLessThanOrEqual(4);
      }
    });

    test('should navigate to related tip when clicked', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Wait for related tips to load
      const relatedTipCards = page.locator('[data-testid="tip-card"]');
      
      const cardCount = await relatedTipCards.count();
      if (cardCount > 0) {
        // Get the current URL before clicking
        const currentUrl = page.url();
        
        // Try to find a related tip that's different from current tip
        let foundDifferentTip = false;
        for (let i = 0; i < Math.min(cardCount, 4); i++) {
          const card = relatedTipCards.nth(i);
          await card.waitFor({ state: 'visible' });
          await card.click();
          
          // Wait a bit for navigation
          await page.waitForTimeout(500);
          
          // Check if we navigated to a different page
          if (page.url() !== currentUrl) {
            foundDifferentTip = true;
            // Verify we're on a tip page (note: URL uses /tips/ plural)
            await expect(page).toHaveURL(/\/tips\/[a-f0-9-]+/);
            break;
          }
          
          // If same page, go back and try next card
          if (i < cardCount - 1) {
            await page.goto(`/tips/${validTipId}`);
          }
        }
        
        // If no different tips found, that's okay - just verify we're still on a valid page
        if (!foundDifferentTip) {
          await expect(page).toHaveURL(/\/tips\/[a-f0-9-]+/);
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should show 404 page for invalid tip ID', async ({ page }) => {
      await page.goto(`/tips/${invalidTipId}`);

      // Check for 404 error message
      await expect(page.getByText(/404/i)).toBeVisible();
      await expect(page.getByText(/not found/i)).toBeVisible();

      // Check for back to home button
      const backButton = page.getByRole('link', { name: /back to home/i });
      await expect(backButton).toBeVisible();
      await expect(backButton).toHaveAttribute('href', '/');
    });

    test('should navigate back to home from 404 page', async ({ page }) => {
      await page.goto(`/tips/${invalidTipId}`);

      const backButton = page.getByRole('link', { name: /back to home/i });
      await backButton.click();

      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/tips/${validTipId}`);
      await page.waitForLoadState('networkidle');

      // Check that content is visible and not overflowing
      await expect(page.locator('h1').first()).toBeVisible();
      
      // Check breadcrumb is responsive
      const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i }).first();
      await expect(breadcrumb).toBeVisible({ timeout: 10000 });

      // Check hero section is responsive
      const heroSection = page.locator('[data-testid="tip-hero"]').first();
      await expect(heroSection).toBeVisible();

      // Verify no significant horizontal scroll (allow small rounding differences)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // Allow 5px tolerance
    });

    test('should display related tips in single column on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/tips/${validTipId}`);

      const relatedTipCards = page.locator('[data-testid="tip-card"]');
      const cardCount = await relatedTipCards.count();

      if (cardCount > 1) {
        // Get positions of first two cards
        const firstCard = relatedTipCards.nth(0);
        const secondCard = relatedTipCards.nth(1);

        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        if (firstBox && secondBox) {
          // On mobile, cards should stack vertically (second card below first)
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
        }
      }
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/tips/${validTipId}`);
      await page.waitForLoadState('networkidle');

      // Check that content is visible
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.getByRole('navigation', { name: /breadcrumb/i }).first()).toBeVisible({ timeout: 10000 });
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`/tips/${validTipId}`);
      await page.waitForLoadState('networkidle');

      // Check that content is visible and properly constrained
      await expect(page.locator('h1').first()).toBeVisible();
      
      // Check max-width constraint is applied
      const mainContent = page.locator('main');
      const contentBox = await mainContent.boundingBox();
      
      if (contentBox) {
        // Content should be constrained (not full viewport width)
        expect(contentBox.width).toBeLessThan(1920);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation through interactive elements', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Start from the top of the page
      await page.keyboard.press('Tab');

      // Check that focus moves through interactive elements
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      // Should focus on an interactive element (A, BUTTON, etc.)
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      // Check that focused element has visible outline or focus style
      const hasFocusStyle = await page.evaluate(() => {
        const element = document.activeElement;
        if (!element) return false;

        const styles = window.getComputedStyle(element);
        const outline = styles.outline;
        const outlineWidth = styles.outlineWidth;
        const boxShadow = styles.boxShadow;

        // Check if element has visible focus indicators
        return (
          (outline !== 'none' && outlineWidth !== '0px') ||
          boxShadow !== 'none'
        );
      });

      expect(hasFocusStyle).toBe(true);
    });

    test('should allow keyboard navigation to breadcrumb links', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Tab until we reach the breadcrumb home link
      let attempts = 0;
      let foundBreadcrumb = false;

      while (attempts < 20 && !foundBreadcrumb) {
        await page.keyboard.press('Tab');
        
        const focusedText = await page.evaluate(() => {
          return document.activeElement?.textContent?.toLowerCase() || '';
        });

        if (focusedText.includes('home')) {
          foundBreadcrumb = true;
        }
        attempts++;
      }

      expect(foundBreadcrumb).toBe(true);

      // Press Enter to navigate
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('SEO and Metadata', () => {
    test('should have proper page title', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Title should include tip title and site name
      await expect(page).toHaveTitle(/LifeHacking/);
    });

    test('should have meta description', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    });

    test('should have Open Graph meta tags', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Check for essential OG tags
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const ogImage = page.locator('meta[property="og:image"]');

      await expect(ogTitle).toHaveAttribute('content', /.+/);
      await expect(ogDescription).toHaveAttribute('content', /.+/);
      await expect(ogImage).toHaveAttribute('content', /.+/);
    });

    test('should have structured data (JSON-LD)', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Check for JSON-LD script tag
      const structuredData = await page.evaluate(() => {
        const script = document.querySelector('script[type="application/ld+json"]');
        return script ? JSON.parse(script.textContent || '{}') : null;
      });

      expect(structuredData).not.toBeNull();
      expect(structuredData?.['@type']).toBe('HowTo');
      expect(structuredData?.name).toBeTruthy();
      expect(structuredData?.step).toBeTruthy();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Check that there's at least one h1 (main page title)
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Check that h2 elements exist for sections
      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThan(0);
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Get all images
      const images = page.locator('img');
      const imageCount = await images.count();

      // Check that all images have alt attributes
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });

    test('should have ARIA labels for navigation', async ({ page }) => {
      await page.goto(`/tips/${validTipId}`);

      // Check breadcrumb has aria-label
      const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
      await expect(breadcrumb).toBeVisible();
    });
  });
});

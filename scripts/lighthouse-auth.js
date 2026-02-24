/**
 * Lighthouse CI Authentication Script
 * 
 * This script handles JWT authentication for Lighthouse audits.
 * It logs in using test credentials and stores the auth token/cookies
 * for Lighthouse to use when auditing authenticated pages.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.LHCI_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.LHCI_TEST_EMAIL;
const TEST_PASSWORD = process.env.LHCI_TEST_PASSWORD;

async function authenticate() {
  console.log('🔐 Starting authentication process...');

  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.error('❌ Missing credentials: LHCI_TEST_EMAIL and LHCI_TEST_PASSWORD must be set');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to login page
    console.log(`📍 Navigating to ${BASE_URL}/login`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });

    // Fill in login form
    console.log('📝 Filling login form...');
    await page.type('input[type="email"], input[name="email"]', TEST_EMAIL);
    await page.type('input[type="password"], input[name="password"]', TEST_PASSWORD);

    // Submit form
    console.log('🚀 Submitting login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);

    // Wait for authentication to complete
    await page.waitForTimeout(2000);

    // Get cookies and local storage
    const cookies = await page.cookies();
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        items[key] = window.localStorage.getItem(key);
      }
      return items;
    });

    // Save authentication data
    const authData = {
      cookies,
      localStorage,
      timestamp: new Date().toISOString()
    };

    const authFilePath = path.join(__dirname, '..', '.lighthouse-auth.json');
    fs.writeFileSync(authFilePath, JSON.stringify(authData, null, 2));

    console.log('✅ Authentication successful!');
    console.log(`📄 Auth data saved to ${authFilePath}`);
    console.log(`🍪 Cookies: ${cookies.length}`);
    console.log(`💾 LocalStorage items: ${Object.keys(localStorage).length}`);

  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

authenticate();

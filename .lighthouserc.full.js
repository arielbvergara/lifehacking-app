/**
 * Lighthouse CI Configuration - Full Crawl
 * 
 * This configuration performs comprehensive audits across the entire site.
 * Run with: npm run lighthouse:full
 * Best used for scheduled/nightly audits.
 */

const fs = require('fs');
const path = require('path');

// Load authentication data if available
let authData = null;
const authFilePath = path.join(__dirname, '.lighthouse-auth.json');
if (fs.existsSync(authFilePath)) {
  authData = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
}

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'Ready',
      startServerReadyTimeout: 60000,
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/about',
        'http://localhost:3000/login',
        'http://localhost:3000/signup',
        'http://localhost:3000/profile',
        'http://localhost:3000/favorites',
        'http://localhost:3000/tips/latest',
        'http://localhost:3000/tips/popular',
        'http://localhost:3000/categories',
        'http://localhost:3000/search',
        'http://localhost:3000/contact',
        'http://localhost:3000/privacy',
        'http://localhost:3000/terms',
      ],
      numberOfRuns: 5,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Apply authentication if available
        ...(authData && {
          extraHeaders: JSON.stringify({
            Cookie: authData.cookies.map(c => `${c.name}=${c.value}`).join('; ')
          })
        })
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
  },
};

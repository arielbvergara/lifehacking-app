/**
 * Lighthouse CI Configuration - CI/CD Pipeline
 * 
 * This configuration is optimized for fast PR checks with strict performance budgets.
 * Run with: npm run lighthouse:ci
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
      // In CI, the server should already be running
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/profile',
        'http://localhost:3000/favorites',
        'http://localhost:3000/tips/popular',
        'http://localhost:3000/search',
      ],
      numberOfRuns: 3,
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
        // Stricter thresholds for CI to catch regressions
        'categories:performance': ['error', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.85 }],
        
        // Performance budgets
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
      },
    },
  },
};

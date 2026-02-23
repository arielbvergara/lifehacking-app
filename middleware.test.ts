/**
 * Security Headers Middleware Tests
 *
 * Validates that the middleware sets all required security headers.
 * Covers OWASP A05:2021 Security Misconfiguration mitigations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: () => {
        const headers = new Map<string, string>();
        return {
          headers: {
            set: (key: string, value: string) => headers.set(key, value),
            get: (key: string) => headers.get(key),
          },
        };
      },
    },
  };
});

describe('Security Headers Middleware', () => {
  let request: NextRequest;

  beforeEach(() => {
    request = new NextRequest(new URL('http://localhost:3000/'));
  });

  it('should set X-Content-Type-Options header', () => {
    const response = middleware(request);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('should set X-Frame-Options header to DENY', () => {
    const response = middleware(request);
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('should set Referrer-Policy header', () => {
    const response = middleware(request);
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('should set Permissions-Policy header', () => {
    const response = middleware(request);
    expect(response.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()'
    );
  });

  it('should set Strict-Transport-Security header', () => {
    const response = middleware(request);
    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
  });

  it('should set X-DNS-Prefetch-Control header', () => {
    const response = middleware(request);
    expect(response.headers.get('X-DNS-Prefetch-Control')).toBe('on');
  });
});

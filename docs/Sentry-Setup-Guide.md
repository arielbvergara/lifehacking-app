# Sentry.io Setup Guide

This document provides an overview of the Sentry.io integration in the Lifehacking App for error tracking, performance monitoring, and logging.

## Overview

Sentry is configured to provide:
- **Error Tracking**: Automatic capture of unhandled exceptions
- **Performance Monitoring**: Transaction tracing for page loads and API calls
- **Logging**: Console log integration for all log levels
- **Session Replay**: Visual reproduction of user sessions (client-side only)

## Configuration Files

### Core Configuration

1. **sentry.client.config.ts** - Client-side initialization
   - Enables session replay
   - Configures console logging integration
   - Sets up error and performance monitoring

2. **sentry.server.config.ts** - Server-side initialization
   - Configures server-side error tracking
   - Enables console logging integration

3. **sentry.edge.config.ts** - Edge runtime initialization
   - Configures edge function error tracking
   - Enables console logging integration

4. **instrumentation.ts** - Next.js instrumentation hook
   - Loads appropriate Sentry configuration based on runtime

5. **next.config.ts** - Sentry webpack plugin configuration
   - Configures source map upload
   - Sets up monitoring tunnel route
   - Enables automatic instrumentation

## Environment Variables

Add the following to your `.env.local` file:

```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

The DSN is publicly accessible and safe to expose in client-side code.

## Usage

### Error Capture

#### Automatic Error Capture

All error boundaries automatically capture exceptions:

```typescript
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  
  // ... error UI
}
```

#### Manual Error Capture

Use the utility function for manual error capture:

```typescript
import { captureException } from '@/lib/utils/sentry';

try {
  // ... code that might throw
} catch (error) {
  captureException(error as Error, {
    userId: '123',
    action: 'data-fetch',
  });
}
```

### Performance Monitoring

#### API Call Tracing

Wrap API calls with spans to track performance:

```typescript
import * as Sentry from '@sentry/nextjs';

export async function fetchData(id: string) {
  return Sentry.startSpan(
    {
      op: 'http.client',
      name: `GET /api/data/${id}`,
    },
    async (span) => {
      span.setAttribute('data.id', id);
      
      const response = await fetch(`/api/data/${id}`);
      const data = await response.json();
      
      span.setAttribute('data.found', true);
      return data;
    }
  );
}
```

#### UI Action Tracing

Track user interactions with custom spans:

```typescript
import * as Sentry from '@sentry/nextjs';

const handleButtonClick = async () => {
  await Sentry.startSpan(
    {
      op: 'ui.action',
      name: 'Submit Form',
    },
    async (span) => {
      span.setAttribute('form.type', 'category');
      
      // ... form submission logic
      
      span.setAttribute('form.success', true);
    }
  );
};
```

#### Using the Utility Helper

```typescript
import { withSpan } from '@/lib/utils/sentry';

const result = await withSpan(
  'http.client',
  'GET /api/users',
  async (span) => {
    const users = await fetchUsers();
    return users;
  },
  { endpoint: '/api/users', method: 'GET' }
);
```

### Logging

#### Structured Logging

Use Sentry's logger for structured logs:

```typescript
import { logger } from '@/lib/utils/sentry';

// Basic logging
logger.info('User logged in', { userId: '123' });
logger.warn('Rate limit approaching', { remaining: 10 });
logger.error('Payment failed', { orderId: 'order_123' });

// Template literals with logger.fmt
logger.debug(logger.fmt`Cache miss for user: ${userId}`);
```

#### Console Integration

All console.log, console.warn, and console.error calls are automatically sent to Sentry as logs.

## Best Practices

### Error Context

Always provide context when capturing errors:

```typescript
captureException(error, {
  userId: user.id,
  action: 'checkout',
  cartValue: cart.total,
});
```

### Span Attributes

Add meaningful attributes to spans:

```typescript
span.setAttribute('user.id', userId);
span.setAttribute('request.size', data.length);
span.setAttribute('cache.hit', true);
```

### Sensitive Data

Never log sensitive information:
- Passwords
- API keys
- Credit card numbers
- Personal identification numbers

### Performance

- Use appropriate sample rates in production
- Limit span creation to meaningful operations
- Avoid creating spans in tight loops

## Monitoring

### Sentry Dashboard

Access your Sentry dashboard at: https://sentry.io/organizations/arielbvergara/

Key sections:
- **Issues**: View and triage errors
- **Performance**: Analyze transaction performance
- **Releases**: Track deployments
- **Alerts**: Configure notifications

### Tunnel Route

Requests to Sentry are routed through `/monitoring` to bypass ad-blockers and improve reliability.

## Troubleshooting

### Errors Not Appearing

1. Check that `NEXT_PUBLIC_SENTRY_DSN` is set
2. Verify Sentry is initialized (check browser console)
3. Ensure error boundaries are in place
4. Check Sentry project settings

### Performance Data Missing

1. Verify `tracesSampleRate` is > 0
2. Check that spans are being created
3. Ensure instrumentation.ts is loaded

### Source Maps Not Uploading

1. Verify Sentry auth token is configured
2. Check build logs for upload errors
3. Ensure `org` and `project` are correct in next.config.ts

## Configuration Options

### Sample Rates

Adjust in configuration files:

```typescript
Sentry.init({
  tracesSampleRate: 1.0, // 100% in development
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
});
```

### Environment Detection

Sentry automatically detects the environment from `NODE_ENV`:
- `development`: Full logging and tracing
- `production`: Optimized for performance

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring Guide](https://docs.sentry.io/product/performance/)
- [Error Tracking Best Practices](https://docs.sentry.io/product/issues/)

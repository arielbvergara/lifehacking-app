// API Configuration

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5055';

export const API_TIMEOUT_MS = 10000; // 10 seconds

export const ADMIN_API_TIMEOUT_MS = 30000; // 30 seconds for admin operations

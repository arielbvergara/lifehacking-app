import { createMockApiServer } from './helpers/mock-api-server';

/**
 * Global setup for Playwright tests
 * Starts a mock API server before running tests
 */
async function globalSetup() {
  // Start mock API server on port 8080
  const server = await createMockApiServer();
  
  // Store server instance for global teardown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).__MOCK_API_SERVER__ = server;
  
  console.log('Mock API server started on http://localhost:8080');
  
  // Verify the server is responding
  try {
    const response = await fetch('http://localhost:8080/api/Category');
    if (response.ok) {
      console.log('Mock API server is responding correctly');
    } else {
      console.warn('Mock API server returned non-OK status:', response.status);
    }
  } catch (error) {
    console.error('Failed to verify mock API server:', error);
  }
  
  // Give the server a moment to stabilize
  await new Promise(resolve => setTimeout(resolve, 1000));
}

export default globalSetup;

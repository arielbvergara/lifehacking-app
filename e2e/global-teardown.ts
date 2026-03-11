/**
 * Global teardown for Playwright tests
 * Stops the mock API server after all tests complete
 */
async function globalTeardown() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const server = (global as any).__MOCK_API_SERVER__;
  
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log('Mock API server stopped');
        resolve();
      });
    });
  }
}

export default globalTeardown;

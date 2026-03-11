import { createServer, IncomingMessage, ServerResponse } from 'http';
import {
  MOCK_CATEGORIES_RESPONSE,
  MOCK_TIPS,
} from '../fixtures/mock-data';

/**
 * Creates a mock API server for e2e tests
 * Handles API requests and returns mock data
 */
export function createMockApiServer() {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Set JSON content type
    res.setHeader('Content-Type', 'application/json');

    try {
      // Route: GET /api/Category (capital C for backend compatibility)
      if ((pathname === '/api/Category' || pathname === '/api/categories') && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(MOCK_CATEGORIES_RESPONSE));
        return;
      }

      // Route: GET /api/Category/:id
      if ((pathname.startsWith('/api/Category/') || pathname.startsWith('/api/categories/')) && req.method === 'GET') {
        const categoryId = pathname.split('/')[3];
        const categoryTips = MOCK_TIPS.filter((tip) => tip.categoryId === categoryId);
        
        res.writeHead(200);
        res.end(
          JSON.stringify({
            items: categoryTips,
            totalCount: categoryTips.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        );
        return;
      }

      // Route: GET /api/Tip (capital T for backend compatibility)
      if ((pathname === '/api/Tip' || pathname === '/api/tips') && req.method === 'GET') {
        const searchQuery = url.searchParams.get('q') || url.searchParams.get('search');
        const sortBy = url.searchParams.get('sortBy');
        const orderBy = url.searchParams.get('orderBy');

        let tips = [...MOCK_TIPS];

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          tips = tips.filter(
            (tip) =>
              tip.title.toLowerCase().includes(query) ||
              tip.description.toLowerCase().includes(query) ||
              tip.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        }

        // Sort tips (orderBy: 0 = CreatedAt, sortDirection: 1 = Descending)
        if (orderBy === '0' || sortBy === 'latest') {
          tips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'popular') {
          tips.sort((a, b) => b.viewCount - a.viewCount);
        }

        res.writeHead(200);
        res.end(
          JSON.stringify({
            items: tips,
            totalCount: tips.length,
            page: 1,
            pageSize: 20,
            totalPages: Math.ceil(tips.length / 20),
          })
        );
        return;
      }

      // Route: GET /api/Tip/:id
      if ((pathname.startsWith('/api/Tip/') || pathname.startsWith('/api/tips/')) && req.method === 'GET') {
        const tipId = pathname.split('/')[3];

        // Find tip in mock data
        const tip = MOCK_TIPS.find((t) => t.id === tipId);

        if (tip) {
          res.writeHead(200);
          res.end(JSON.stringify(tip));
        } else {
          res.writeHead(404);
          res.end(
            JSON.stringify({
              status: 404,
              type: 'https://httpstatuses.io/404/resource-not-found',
              title: 'Resource not found',
              detail: `Tip with id '${tipId}' was not found.`,
            })
          );
        }
        return;
      }

      // Default 404 response
      res.writeHead(404);
      res.end(
        JSON.stringify({
          status: 404,
          message: `Not found: ${pathname}`,
        })
      );
    } catch (error) {
      console.error('Mock API server error:', error);
      res.writeHead(500);
      res.end(
        JSON.stringify({
          status: 500,
          message: 'Internal server error',
        })
      );
    }
  });

  return new Promise<typeof server>((resolve, reject) => {
    server.listen(8080, () => {
      console.log('Mock API server listening on http://localhost:8080');
      resolve(server);
    });

    server.on('error', (error) => {
      console.error('Failed to start mock API server:', error);
      reject(error);
    });
  });
}

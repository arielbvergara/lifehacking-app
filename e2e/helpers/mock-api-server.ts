import { createServer, IncomingMessage, ServerResponse } from 'http';
import {
  MOCK_CATEGORIES_RESPONSE,
  MOCK_TIPS,
  MOCK_USER_PROFILE,
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

      // Route: GET /api/User/me — returns the mock user profile consumed by
      // AuthProvider's backend sync (`handleUserSync` in lib/api/user.ts).
      if (pathname === '/api/User/me' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify(MOCK_USER_PROFILE));
        return;
      }

      // Route: POST /api/User — called by `createUser` / `createUserInBackend`
      // during the signup flow. Returns the mock profile with a 201 status.
      if (pathname === '/api/User' && req.method === 'POST') {
        res.writeHead(201);
        res.end(JSON.stringify(MOCK_USER_PROFILE));
        return;
      }

      // Route: PUT /api/User/me/name — updateDisplayName. Accept and no-op.
      if (pathname === '/api/User/me/name' && req.method === 'PUT') {
        res.writeHead(204);
        res.end();
        return;
      }

      // Route: DELETE /api/User/me — deleteAccount. Accept and no-op.
      if (pathname === '/api/User/me' && req.method === 'DELETE') {
        res.writeHead(204);
        res.end();
        return;
      }

      // Route: GET /api/me/favorites — FavoritesContext.loadFavorites on mount.
      // Returns an empty favorites list in the backend response shape
      // (`FavoritesApiResponse` in lib/api/favorites.ts).
      if (pathname === '/api/me/favorites' && req.method === 'GET') {
        const pageSize = Number(url.searchParams.get('pageSize') ?? 10);
        const pageNumber = Number(url.searchParams.get('pageNumber') ?? 1);
        res.writeHead(200);
        res.end(
          JSON.stringify({
            favorites: [],
            metadata: {
              totalItems: 0,
              pageNumber,
              pageSize,
              totalPages: 0,
            },
          })
        );
        return;
      }

      // Route: POST /api/me/favorites/merge — merge local favorites after login.
      if (
        pathname === '/api/me/favorites/merge' &&
        req.method === 'POST'
      ) {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            addedCount: 0,
            skippedCount: 0,
            failedCount: 0,
            failedTipIds: [],
          })
        );
        return;
      }

      // Route: POST /api/me/favorites/:tipId — addFavorite.
      if (
        pathname.startsWith('/api/me/favorites/') &&
        req.method === 'POST'
      ) {
        res.writeHead(201);
        res.end();
        return;
      }

      // Route: DELETE /api/me/favorites/:tipId — removeFavorite.
      if (
        pathname.startsWith('/api/me/favorites/') &&
        req.method === 'DELETE'
      ) {
        res.writeHead(204);
        res.end();
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

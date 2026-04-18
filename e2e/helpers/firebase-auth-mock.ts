import type { Page, Route } from '@playwright/test';
import { E2E_TEST_EMAIL, E2E_TEST_USER_UID } from '../fixtures/mock-data';

/**
 * Firebase Auth mock for Playwright e2e tests.
 *
 * In CI the app runs with dummy Firebase credentials (see .github/workflows/ci.yml).
 * Firebase's `signInWithEmailAndPassword` would POST to the real
 * `identitytoolkit.googleapis.com` with those dummy keys and Google would reject
 * them, making every authenticated spec fail at the login step.
 *
 * This helper installs `page.route()` handlers that intercept every request the
 * Firebase Web SDK makes during an email/password flow and returns a
 * structurally valid response, so tests never leave the browser.
 *
 * Nothing in production code changes — the interception is scoped to the
 * Playwright page and is only installed by helpers that actually sign in
 * (`login()` in `auth-helper.ts`).
 */

const IDENTITYTOOLKIT_HOST = 'https://identitytoolkit.googleapis.com/**';
const SECURETOKEN_HOST = 'https://securetoken.googleapis.com/**';

const DEFAULT_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'ci-build-dummy';

export interface FirebaseAuthMockOptions {
  /** Firebase `localId` / `user_id` claim to return. Defaults to E2E_TEST_USER_UID. */
  uid?: string;
  /** Email claim to return. Defaults to E2E_TEST_EMAIL. */
  email?: string;
  /** Display name to include in the ID token. Defaults to empty string. */
  displayName?: string;
}

/**
 * Base64url-encode (no padding) a JSON value. Used to build a syntactically
 * valid JWT — the Firebase SDK decodes the payload to derive `sub`, `exp`, etc.
 */
function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Build a fake but structurally valid JWT for the given claims.
 *
 * The Firebase SDK only parses the payload (header `alg` is ignored in the
 * client path we exercise) to surface `sub`/`uid`, expiry, and sign-in
 * provider. The signature is a placeholder because nothing verifies it in the
 * intercepted flow.
 */
function buildFakeIdToken(
  uid: string,
  email: string,
  displayName: string,
  projectId: string,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    iss: `https://securetoken.google.com/${projectId}`,
    aud: projectId,
    auth_time: now,
    user_id: uid,
    sub: uid,
    iat: now,
    exp: now + 3600,
    email,
    email_verified: true,
    name: displayName,
    firebase: {
      identities: { email: [email] },
      sign_in_provider: 'password',
    },
  };

  return [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(payload)),
    'sig',
  ].join('.');
}

/**
 * Respond with a `signInWithPassword` / `signUp` success payload.
 */
function fulfillSignInResponse(
  route: Route,
  uid: string,
  email: string,
  idToken: string,
): Promise<void> {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      kind: 'identitytoolkit#VerifyPasswordResponse',
      localId: uid,
      email,
      displayName: '',
      idToken,
      registered: true,
      refreshToken: 'fake-refresh-token',
      expiresIn: '3600',
    }),
  });
}

/**
 * Respond with an `accounts:lookup` payload (Firebase calls this to hydrate
 * user info on state change).
 */
function fulfillLookupResponse(
  route: Route,
  uid: string,
  email: string,
): Promise<void> {
  const nowMs = Date.now();
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      kind: 'identitytoolkit#GetAccountInfoResponse',
      users: [
        {
          localId: uid,
          email,
          emailVerified: true,
          providerUserInfo: [
            {
              providerId: 'password',
              federatedId: email,
              email,
              rawId: email,
            },
          ],
          validSince: String(Math.floor(nowMs / 1000)),
          lastLoginAt: String(nowMs),
          createdAt: String(nowMs),
          passwordHash: 'fake-hash',
          passwordUpdatedAt: nowMs,
        },
      ],
    }),
  });
}

/**
 * Respond with a securetoken refresh payload.
 */
function fulfillSecureTokenResponse(
  route: Route,
  uid: string,
  idToken: string,
  projectId: string,
): Promise<void> {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      access_token: idToken,
      expires_in: '3600',
      token_type: 'Bearer',
      refresh_token: 'fake-refresh-token',
      id_token: idToken,
      user_id: uid,
      project_id: projectId,
    }),
  });
}

/**
 * Install Firebase Auth mock routes on the given Playwright page.
 *
 * Must be called BEFORE navigating to any page that triggers the Firebase SDK
 * (e.g. `/login`, `/signup`, or any page that mounts `AuthProvider`).
 */
export async function setupFirebaseAuthMocks(
  page: Page,
  options: FirebaseAuthMockOptions = {},
): Promise<void> {
  const uid = options.uid ?? E2E_TEST_USER_UID;
  const email = options.email ?? E2E_TEST_EMAIL;
  const displayName = options.displayName ?? '';
  const projectId = DEFAULT_PROJECT_ID;
  const idToken = buildFakeIdToken(uid, email, displayName, projectId);

  await page.route(IDENTITYTOOLKIT_HOST, async (route) => {
    const url = route.request().url();

    if (url.includes('/accounts:signInWithPassword')) {
      await fulfillSignInResponse(route, uid, email, idToken);
      return;
    }

    if (url.includes('/accounts:signUp')) {
      // signUp returns the same shape as signInWithPassword for our purposes.
      await fulfillSignInResponse(route, uid, email, idToken);
      return;
    }

    if (url.includes('/accounts:lookup')) {
      await fulfillLookupResponse(route, uid, email);
      return;
    }

    // Fallback for any other identitytoolkit call (sendOobCode, delete, etc.)
    // so the SDK never leaves the browser. Empty JSON object is a safe no-op
    // for responses we don't model explicitly.
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    });
  });

  await page.route(SECURETOKEN_HOST, async (route) => {
    const url = route.request().url();

    if (url.includes('/v1/token')) {
      await fulfillSecureTokenResponse(route, uid, idToken, projectId);
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    });
  });
}

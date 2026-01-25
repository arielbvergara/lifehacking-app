"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const userMeEndpointPath = "/api/User/me" as const;

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idToken, setIdToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<unknown | null>(null);
  const [userProfileError, setUserProfileError] = useState<string | null>(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);

  // Simple auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
        } catch (err) {
          console.error("Failed to get ID token", err);
          setIdToken(null);
        }
      } else {
        setIdToken(null);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!idToken) {
      setUserProfile(null);
      setUserProfileError(null);
      setUserProfileLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchUserProfile = async () => {
      setUserProfileLoading(true);
      setUserProfileError(null);

      try {
        const response = await fetch(`${apiBaseUrl}${userMeEndpointPath}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          let backendMessage = "Failed to load user profile";
          try {
            const problem = await response.json();
            if (problem && typeof problem.detail === "string") {
              backendMessage = problem.detail;
            }
          } catch {
            // Ignore JSON parse errors and keep the generic message.
          }
          throw new Error(backendMessage);
        }

        const profile = await response.json();
        setUserProfile(profile);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        const message =
          err instanceof Error && err.message
            ? err.message
            : "Failed to load user profile";
        setUserProfileError(message);
        setUserProfile(null);
      } finally {
        setUserProfileLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      abortController.abort();
    };
  }, [idToken]);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message ?? "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message ?? "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Firebase Auth demo
          </h1>

          {user ? (
            <div className="space-y-3 text-zinc-700 dark:text-zinc-300 w-full max-w-xl">
              <p>Signed in as {user.email ?? user.displayName}</p>
              {userProfileLoading && (
                <p className="text-xs text-zinc-500">
                  Loading user profile from /api/User/me...
                </p>
              )}
              {userProfileError && (
                <p className="text-xs text-red-500">
                  {userProfileError}
                </p>
              )}
              {userProfile && (
                <div className="rounded-md border border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                  <p className="mb-1 font-semibold">
                    Backend user profile (/api/User/me):
                  </p>
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(userProfile, null, 2)}
                  </pre>
                </div>
              )}
              {idToken && (
                <div className="rounded-md border border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 break-all">
                  <p className="mb-1 font-semibold">Bearer token (ID token):</p>
                  <code className="whitespace-pre-wrap break-all">
                    {idToken}
                  </code>
                </div>
              )}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-zinc-700 dark:text-zinc-300 w-full max-w-sm">
              <p>Sign in with your email and password.</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-black dark:text-zinc-50 dark:border-zinc-700"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-black dark:text-zinc-50 dark:border-zinc-700"
              />
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Don&apos;t have an account? {" "}
                  <Link
                    href="/signup"
                    className="font-medium text-zinc-900 underline dark:text-zinc-100"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </main>
    </div>
  );
}

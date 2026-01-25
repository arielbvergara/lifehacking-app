"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, User } from "firebase/auth";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const userEndpointPath = "/api/User" as const;

if (!apiBaseUrl) {
  // Fail fast during development if the API base URL is not configured.
  // Configure NEXT_PUBLIC_API_BASE_URL in your environment (e.g., .env.local).
  // This is intentionally outside the component so it surfaces clearly on startup.
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const firebaseUser: User = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      const createUserPayload = {
        email,
        name,
        externalAuthId: firebaseUser.uid,
      } as const;

      const response = await fetch(`${apiBaseUrl}${userEndpointPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(createUserPayload),
      });

      if (!response.ok) {
        let backendMessage = "Failed to create user in backend";
        try {
          const problem = await response.json();
          if (problem && typeof problem.detail === "string") {
            backendMessage = problem.detail;
          }
        } catch {
          // Ignore JSON parse issues and keep the generic message.
        }
        throw new Error(backendMessage);
      }

      setSuccessMessage("Account created successfully.");
      // Optionally redirect to home or another page after a short delay.
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Failed to sign up";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full max-w-sm space-y-6 text-center sm:text-left">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Create your account
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Sign up with your email and password. We will create your Firebase account
            and register you with the CleanArchitecture API.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-black dark:text-zinc-50 dark:border-zinc-700"
            />
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
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Already have an account? {" "}
            <Link
              href="/"
              className="font-medium text-zinc-900 underline dark:text-zinc-100"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

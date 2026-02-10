"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { getFirebaseErrorMessage } from "@/lib/auth/auth-utils";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      onSuccess?.();
    } catch (err: any) {
      const errorCode = err?.code || "unknown";
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons-round text-gray-400">email</span>
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@example.com"
            required
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label
            htmlFor="password"
            className="block text-sm font-bold text-gray-700"
          >
            Password
          </label>
          <a
            href="/forgot-password"
            className="text-sm font-medium text-primary-dark hover:underline"
          >
            Forgot?
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons-round text-gray-400">lock</span>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={loading}
          className="w-5 h-5 border-gray-300 rounded cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-sm text-gray-600 cursor-pointer select-none"
        >
          Keep me logged in
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full font-bold py-3.5 px-4 rounded-xl text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed btn-bounce text-black transition-all bg-primary hover:bg-primary-dark shadow-soft hover:shadow-lg"
      >
        {loading ? (
          <>
            <span className="material-icons-round animate-spin">refresh</span>
            Logging in...
          </>
        ) : (
          <>
            Log In
            <span className="material-icons-round">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}

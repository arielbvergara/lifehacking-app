"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getFirebaseErrorMessage } from "@/lib/auth/auth-utils";

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      const errorCode =
        err &&
        typeof err === "object" &&
        "code" in err &&
        typeof err.code === "string"
          ? err.code
          : "unknown";
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
            disabled={loading || success}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg" role="alert">
          <div className="flex items-start">
            <span className="material-icons-round text-green-600 mr-2">check_circle</span>
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">
                Check your email!
              </p>
              <p className="text-sm text-green-700">
                We&apos;ve sent you a password reset link. If you don&apos;t see it, check your spam folder.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || success}
        className="w-full font-bold py-3.5 px-4 rounded-xl text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed btn-bounce text-black transition-all bg-primary hover:bg-primary-dark shadow-soft hover:shadow-lg"
      >
        {loading ? (
          <>
            <span className="material-icons-round animate-spin">refresh</span>
            Sending...
          </>
        ) : success ? (
          <>
            <span className="material-icons-round">check</span>
            Email Sent
          </>
        ) : (
          <>
            Send Reset Link
            <span className="material-icons-round">arrow_forward</span>
          </>
        )}
      </button>

      {/* Back to Login Link */}
      <div className="text-center mt-6">
        <Link
          href="/login"
          className="text-sm font-medium text-primary-dark hover:underline inline-flex items-center gap-1"
        >
          <span className="material-icons-round text-sm">arrow_back</span>
          Back to Login
        </Link>
      </div>
    </form>
  );
}

import Link from "next/link";
import { Logo } from "@/components/shared/logo";

interface AuthNavProps {
  showSignupButton?: boolean;
  showLoginButton?: boolean;
}

export function AuthNav({ showSignupButton = true, showLoginButton = false }: AuthNavProps) {
  return (
    <nav className="w-full py-6 px-4 md:px-8 bg-transparent relative z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />
        
        {showSignupButton && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:inline">
              New here?
            </span>
            <Link
              href="/signup"
              className="px-5 py-2 rounded-full bg-white text-gray-700 font-bold shadow-sm hover:shadow-md transition-all text-sm border border-gray-100"
            >
              Create Account
            </Link>
          </div>
        )}

        {showLoginButton && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden sm:inline">
              Have an account?
            </span>
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-white text-gray-700 font-bold shadow-sm hover:shadow-md transition-all text-sm border border-gray-100"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

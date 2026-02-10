import Link from "next/link";

export function LoginLink() {
  return (
    <div className="mt-8 text-center pt-6 border-t border-gray-100">
      <p className="text-sm text-gray-500 mb-3">Already have an account?</p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 text-gray-600 font-bold hover:text-primary transition-colors group"
      >
        Sign in
        <span className="material-icons-round group-hover:translate-x-1 transition-transform text-lg">
          arrow_right_alt
        </span>
      </Link>
    </div>
  );
}

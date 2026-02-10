import Link from "next/link";

interface GuestLinkProps {
  href?: string;
}

export function GuestLink({ href = "/" }: GuestLinkProps) {
  return (
    <div className="mt-8 text-center pt-6 border-t border-gray-100">
      <p className="text-sm text-gray-500 mb-3">Just browsing?</p>
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 text-gray-600 font-bold hover:text-primary transition-colors group"
      >
        Continue as Guest
        <span className="material-icons-round group-hover:translate-x-1 transition-transform text-lg">
          arrow_right_alt
        </span>
      </Link>
    </div>
  );
}

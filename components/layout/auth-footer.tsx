import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="py-6 text-center text-sm text-gray-500">
      <div className="flex justify-center gap-6 mb-2">
        <Link href="/privacy" className="hover:text-primary transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-primary transition-colors">
          Terms
        </Link>
        <Link href="/help" className="hover:text-primary transition-colors">
          Help
        </Link>
      </div>
      © {new Date().getFullYear()} LifeHacking
    </footer>
  );
}

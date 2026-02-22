import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  isAdmin?: boolean;
}

export function Logo({ size = "md", href = "/", isAdmin = false }: LogoProps) {
  const iconSize = {
    sm: "w-8 h-8 text-xl",
    md: "w-10 h-10 text-2xl",
    lg: "w-12 h-12 text-3xl",
  }[size];

  const textSize = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  return (
    <Link href={href} className="flex items-center gap-2">
      <div
        className={`${iconSize} rounded-xl flex items-center justify-center transform rotate-3 bg-primary shadow-soft`}
      >
        <span className="material-icons-round text-white">emoji_objects</span>
      </div>
      <span className={`${textSize} font-bold tracking-tight text-gray-900`}>
        LifeHacking
        <span className="text-primary-dark">{isAdmin ? "Admin" : "Buddy"}</span>
      </span>
    </Link>
  );
}

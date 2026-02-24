import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  isAdmin?: boolean;
}

export function Logo({ size = "md", href = "/", isAdmin = false }: LogoProps) {
  const iconSize = {
    sm: "w-12 h-12",
    md: "w-14 h-14",
    lg: "w-16 h-16",
  }[size];

  const textSize = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  }[size];

  return (
    <Link href={href} className="flex items-center gap-3">
      <div
        className={`${iconSize} rounded-xl flex items-center justify-center transform rotate-3 overflow-hidden shadow-soft`}
      >
        <Image
          src="/logo.jpeg"
          alt="LifeHacking Buddy Logo"
          width={64}
          height={64}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      <span className={`${textSize} font-bold tracking-tight text-gray-900`}>
        LifeHacking
        <span className="text-primary-dark">{isAdmin ? "Admin" : "Buddy"}</span>
      </span>
    </Link>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { FavoritesProvider } from "@/lib/context/favorites-context";
import { ToastContainer } from "@/components/shared/toast";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lifehacking.vercel.app'), //TODO: replace for https://lifehacking.com or similar
  title: {
    default: "LifeHackBuddy - Simple Life Hacks for Everyday Living",
    template: "%s | LifeHackBuddy",
  },
  description: "Discover simple tricks for cooking, cleaning, and living better. Browse thousands of practical life hacks organized by category.",
  keywords: ["life hacks", "tips", "tricks", "home organization", "cooking tips", "cleaning hacks", "productivity", "wellness"],
  authors: [{ name: "LifeHackBuddy" }],
  creator: "LifeHackBuddy",
  publisher: "LifeHackBuddy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lifehackbuddy.com",
    siteName: "LifeHackBuddy",
    title: "LifeHackBuddy - Simple Life Hacks for Everyday Living",
    description: "Discover simple tricks for cooking, cleaning, and living better.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LifeHackBuddy - Simple Life Hacks for Everyday Living",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeHackBuddy - Simple Life Hacks for Everyday Living",
    description: "Discover simple tricks for cooking, cleaning, and living better.",
    images: ["/twitter-image.png"],
    creator: "@lifehackbuddy",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.className} antialiased`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </AuthProvider>
        <ToastContainer />
      </body>
    </html>
  );
}

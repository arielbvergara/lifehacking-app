"use client";

import { useRouter } from "next/navigation";
import { CelebrationIcon } from "./celebration-icon";
import { WelcomeActions } from "./welcome-actions";

export function WelcomeCard() {
  const router = useRouter();

  const handleExplore = () => {
    router.push("/");
  };

  const handleViewProfile = () => {
    router.push("/profile");
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 relative z-10 border border-white/50 shadow-soft">
      {/* Celebration Icon */}
      <div className="mb-6">
        <CelebrationIcon />
      </div>

      {/* Heading */}
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 text-gray-900">
        Welcome to the Family!
      </h1>

      {/* Subtext */}
      <p className="text-center text-gray-600 mb-8 text-base">
        Your account has been successfully created. Ready to make life a little easier?
      </p>

      {/* Actions */}
      <WelcomeActions 
        onExplore={handleExplore}
        onViewProfile={handleViewProfile}
      />
    </div>
  );
}

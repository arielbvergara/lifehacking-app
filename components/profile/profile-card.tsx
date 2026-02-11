import { UserProfile } from "@/lib/api/user";
import { ProfileField } from "./profile-field";
import Link from "next/link";

interface ProfileCardProps {
  profile: UserProfile;
  idToken: string;
}

export function ProfileCard({ profile, idToken }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-soft p-8 max-w-2xl w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      <div className="space-y-0">
        <ProfileField label="User ID" value={profile.id} />
        <ProfileField label="Email" value={profile.email} />
        <ProfileField label="Display Name" value={profile.displayName} />
        <ProfileField label="Account Created" value={profile.createdAt} />
        <ProfileField label="ID Token" value={idToken} multiline />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <span className="material-icons-round text-xl">home</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}

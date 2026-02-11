export function ProfileLoading() {
  return (
    <div className="bg-white rounded-3xl shadow-soft p-8">
      <div className="flex flex-col items-center justify-center py-12">
        <span className="material-icons-round animate-spin text-primary text-5xl">
          refresh
        </span>
        <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
      </div>
    </div>
  );
}

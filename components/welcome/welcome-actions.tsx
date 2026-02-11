interface WelcomeActionsProps {
  onExplore: () => void;
  onViewProfile: () => void;
}

export function WelcomeActions({ onExplore, onViewProfile }: WelcomeActionsProps) {
  return (
    <div className="space-y-3">
      {/* Primary Action: Start Exploring Tips */}
      <button
        onClick={onExplore}
        className="w-full font-bold py-3.5 px-4 rounded-xl text-base flex items-center justify-center gap-2 btn-bounce text-black transition-all bg-primary hover:bg-primary-dark shadow-soft hover:shadow-lg"
      >
        Start Exploring Tips
        <span className="material-icons-round">arrow_forward</span>
      </button>

      {/* Secondary Action: View My Profile */}
      <button
        onClick={onViewProfile}
        className="w-full font-medium py-3.5 px-4 rounded-xl text-base flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all"
      >
        <span className="material-icons-round">person</span>
        View My Profile
      </button>
    </div>
  );
}

/**
 * Forgot Password Header Component
 * 
 * Displays the header section for the forgot password page,
 * including an icon, title, and description.
 */

export function ForgotPasswordHeader() {
  return (
    <div className="text-center mb-8">
      {/* Icon Container */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <span className="material-icons-round text-primary text-3xl">
          lock_reset
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Reset Your Password
      </h1>

      {/* Description */}
      <p className="text-gray-600">
        Enter your email address and we&apos;ll send you a link to reset your password
      </p>
    </div>
  );
}

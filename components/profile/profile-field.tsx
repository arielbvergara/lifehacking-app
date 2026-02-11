interface ProfileFieldProps {
  label: string;
  value: string | null;
  multiline?: boolean;
}

export function ProfileField({ label, value, multiline = false }: ProfileFieldProps) {
  const displayValue = value ?? "Not set";
  
  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="text-sm font-bold text-gray-700 mb-1">
        {label}
      </div>
      <div className={`text-base text-gray-900 ${multiline ? 'break-all' : ''}`}>
        {displayValue}
      </div>
    </div>
  );
}

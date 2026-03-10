interface ProgressProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: "blue" | "gold" | "green" | "red";
  size?: "sm" | "md" | "lg";
}

const colors = {
  blue: "bg-brand-blue",
  gold: "bg-brand-gold",
  green: "bg-green-500",
  red: "bg-red-500",
};

const sizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function Progress({
  value,
  label,
  showPercentage = false,
  color = "blue",
  size = "md",
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-brand-blue">{clamped}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${sizes[size]} rounded-full transition-all duration-500 ${colors[color]}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

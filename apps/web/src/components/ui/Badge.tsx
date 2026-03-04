type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "gold";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  gold: "bg-amber-100 text-amber-900",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "PROCESSED":
    case "COMPLETE":
    case "FUNDED":
    case "DONE":
      return "success";
    case "PENDING":
    case "OPEN":
    case "LEAD":
      return "default";
    case "PROCESSING":
    case "IN_PROGRESS":
    case "STRATEGY":
    case "FOUNDATION":
      return "info";
    case "FAILED":
    case "REJECTED":
    case "CLOSED":
      return "error";
    case "WARNING":
    case "ACTIVE":
      return "warning";
    default:
      return "default";
  }
}

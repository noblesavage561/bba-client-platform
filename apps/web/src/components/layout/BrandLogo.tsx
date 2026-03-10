import Image from "next/image";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  compact = false,
  className = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <Image
        src="/bba-logo.svg"
        alt="BBA Services"
        width={compact ? 150 : 210}
        height={compact ? 64 : 89}
        priority={priority}
        className="h-auto"
      />
      {!compact && (
        <div className="hidden sm:block">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Tax Intelligence Platform
          </p>
          <p className="text-xs text-slate-500">
            AI-native preparation, advisory, and review workflows
          </p>
        </div>
      )}
    </div>
  );
}

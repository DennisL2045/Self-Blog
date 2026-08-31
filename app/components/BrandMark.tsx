export function DoodleMoon({ className = "" }: { className?: string }) {
  return <span className={`doodle-moon${className ? ` ${className}` : ""}`} aria-hidden="true" />;
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <span className={`brand-mark${compact ? " compact" : ""}`} aria-hidden="true"><DoodleMoon /></span>;
}

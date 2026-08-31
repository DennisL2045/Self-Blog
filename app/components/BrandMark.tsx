export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <span className={`brand-mark${compact ? " compact" : ""}`} aria-hidden="true">N</span>;
}

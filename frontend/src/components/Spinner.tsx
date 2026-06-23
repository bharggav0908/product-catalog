interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`
        ${SIZE_CLASSES[size]}
        rounded-full
        border-surface-700
        border-t-brand-500
        animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
}

// ─── Full-page loading state ──────────────────────────────────────────────────

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 text-sm animate-pulse-subtle">Loading products...</p>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 flex flex-col gap-3 animate-pulse-subtle">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-slate-700 rounded-full" />
        <div className="h-4 w-16 bg-slate-700/50 rounded" />
      </div>
      <div className="h-4 w-full bg-slate-700 rounded" />
      <div className="h-4 w-3/4 bg-slate-700/70 rounded" />
      <div className="mt-auto flex items-center justify-between">
        <div className="h-6 w-20 bg-slate-700 rounded" />
        <div className="h-4 w-16 bg-slate-700/50 rounded" />
      </div>
    </div>
  );
}

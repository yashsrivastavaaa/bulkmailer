'use client';

export default function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="route-loading route-skeleton" role="status" aria-label={label}>
      <div className="route-skeleton-sidebar">
        <div className="skeleton-block brand" />
        <div className="skeleton-nav-group">{Array.from({ length: 7 }).map((_, i) => <div className="skeleton-block nav" key={i} />)}</div>
        <div className="skeleton-block plan" />
      </div>
      <div className="route-skeleton-main">
        <div className="route-skeleton-top"><div className="skeleton-block crumb" /><div className="skeleton-block account" /></div>
        <div className="route-skeleton-content">
          <div className="skeleton-block eyebrow" /><div className="skeleton-block title" /><div className="skeleton-block subtitle" />
          <div className="skeleton-kpis">{Array.from({ length: 4 }).map((_, i) => <div className="skeleton-card" key={i} />)}</div>
          <div className="skeleton-grid"><div className="skeleton-card large" /><div className="skeleton-card large" /></div>
        </div>
      </div>
    </div>
  );
}

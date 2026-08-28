'use client';

export default function LoadingScreen({ label = 'Loading' }: { label?: string }) {
  return <div className="route-loading" role="status" aria-label={label}>
    <div className="loading-orb" aria-hidden="true" />
  </div>;
}

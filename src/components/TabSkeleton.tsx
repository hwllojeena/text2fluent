'use client';

/** Reusable skeleton block — applies the shimmer animation via CSS class. */
function SkeletonBlock({ width = '100%', height = '1rem', borderRadius = '8px', style = {} }: {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton-block"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

/** Card wrapper that matches the real tabs' card style. */
function SkeletonCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '20px',
        border: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Skeleton for PracticeView                              */
/* ─────────────────────────────────────────────────────── */
export function PracticeSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '700px', margin: '2rem auto 0' }}>
      {/* Filter row */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <SkeletonBlock height="3rem" borderRadius="16px" />
        <SkeletonBlock height="3rem" borderRadius="16px" />
        <SkeletonBlock height="3rem" borderRadius="16px" />
      </div>

      {/* Spin card */}
      <SkeletonCard style={{ alignItems: 'center', gap: '1.5rem', padding: '2.5rem' }}>
        <SkeletonBlock width="60%" height="1.2rem" borderRadius="8px" />
        <SkeletonBlock width="100%" height="8rem" borderRadius="16px" />
        <SkeletonBlock width="12rem" height="3.5rem" borderRadius="100px" style={{ marginTop: '0.5rem' }} />
      </SkeletonCard>

      {/* Waveform / record area */}
      <SkeletonCard style={{ gap: '1rem' }}>
        <SkeletonBlock width="40%" height="1rem" />
        <SkeletonBlock width="100%" height="5rem" borderRadius="16px" />
        <SkeletonBlock width="12rem" height="3rem" borderRadius="100px" style={{ alignSelf: 'center' }} />
      </SkeletonCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Skeleton for HistoryTab                                */
/* ─────────────────────────────────────────────────────── */
export function HistorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '2rem auto 0' }}>
      {/* Header row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.5)', padding: '1.5rem',
        borderRadius: '20px', border: '1px solid var(--card-border)',
      }}>
        <SkeletonBlock width="10rem" height="1.5rem" borderRadius="8px" />
        <SkeletonBlock width="8rem" height="2.5rem" borderRadius="16px" />
      </div>

      {/* History cards */}
      {[1, 2, 3].map(i => (
        <SkeletonCard key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBlock width="55%" height="1.1rem" borderRadius="8px" />
            <SkeletonBlock width="5rem" height="1rem" borderRadius="8px" />
          </div>
          <SkeletonBlock width="90%" height="1.2rem" borderRadius="6px" style={{ marginTop: '0.5rem' }} />
          <SkeletonBlock width="75%" height="1.2rem" borderRadius="6px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <SkeletonBlock width="4.5rem" height="1rem" borderRadius="6px" />
            <SkeletonBlock width="3rem" height="1.2rem" borderRadius="6px" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Skeleton for VocabTab                                  */
/* ─────────────────────────────────────────────────────── */
export function VocabSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '2rem auto 0' }}>
      {/* Header row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.5)', padding: '1.5rem',
        borderRadius: '20px', border: '1px solid var(--card-border)',
      }}>
        <SkeletonBlock width="10rem" height="1.5rem" borderRadius="8px" />
        <SkeletonBlock width="8rem" height="2.5rem" borderRadius="16px" />
      </div>

      {/* Vocab cards */}
      {[1, 2, 3, 4].map(i => (
        <SkeletonCard key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBlock width="8rem" height="1.6rem" borderRadius="8px" />
            <SkeletonBlock width="6rem" height="1rem" borderRadius="8px" />
          </div>
          <SkeletonBlock width="100%" height="1rem" borderRadius="6px" />
          <SkeletonBlock width="80%" height="1rem" borderRadius="6px" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <SkeletonBlock width="5rem" height="1.8rem" borderRadius="8px" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/*  Skeleton for TestTab                                   */
/* ─────────────────────────────────────────────────────── */
export function TestSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '2rem auto 0' }}>
      {/* Info header */}
      <SkeletonCard style={{ background: 'rgba(255,255,255,0.5)', gap: '0.75rem' }}>
        <SkeletonBlock width="14rem" height="1.5rem" borderRadius="8px" />
        <SkeletonBlock width="100%" height="1rem" borderRadius="6px" />
        <SkeletonBlock width="80%" height="1rem" borderRadius="6px" />
      </SkeletonCard>

      {/* Language test cards */}
      {[1, 2, 3, 4, 5].map(i => (
        <SkeletonCard key={i} style={{ gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBlock width="9rem" height="1.4rem" borderRadius="8px" />
          </div>
          {/* Progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <SkeletonBlock width="7rem" height="0.85rem" borderRadius="4px" />
              <SkeletonBlock width="3rem" height="0.85rem" borderRadius="4px" />
            </div>
            <SkeletonBlock width="100%" height="8px" borderRadius="4px" />
          </div>
          <SkeletonBlock width="13rem" height="0.9rem" borderRadius="4px" />
        </SkeletonCard>
      ))}
    </div>
  );
}

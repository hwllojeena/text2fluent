'use client';

import { useRouter } from 'next/navigation';

export default function UnauthenticatedView() {
  const router = useRouter();

  return (
    <div className="main-layout">
      {/* Permanent Left Panel */}
      <aside className="left-panel animate-fade-in">
        <h1 style={{ fontSize: '5rem', lineHeight: '1', marginBottom: '1rem' }}>
          Speak your way to fluency
        </h1>
        <p className="platform-description">
          Text2Fluent is an AI-powered platform that helps you build confidence in any language. 
          Read texts aloud, get instant feedback, and improve your fluency step by step.
        </p>
      </aside>

      {/* Dynamic Right Panel */}
      <section className="right-panel">
        <div className="animate-fade-in" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div className="premium-card" style={{ maxWidth: '450px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Authentication Required</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Oops! It looks like you're not logged in. Please sign in or create an account to access this page and continue your language journey.
            </p>
            <button 
              className="btn-primary" 
              onClick={() => router.push('/')}
              style={{ padding: '1rem 2rem', fontSize: '1.2rem', width: '100%' }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

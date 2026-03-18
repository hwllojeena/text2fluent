'use client';

import { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { useSession, signOut } from '@/components/Providers';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      const metadata = session?.user?.user_metadata?.text2fluent_onboarding;
      const localDataStr = localStorage.getItem('text2fluent_onboarding');
      
      let parsedData = null;
      if (metadata) {
        parsedData = metadata;
        // Keep local storage in sync
        localStorage.setItem('text2fluent_onboarding', JSON.stringify(metadata));
      } else if (localDataStr) {
        parsedData = JSON.parse(localDataStr);
      }

      if (parsedData) {
        if (parsedData.completed) {
          router.push('/practice');
        } else {
          if (parsedData.selectedLevel === '6') {
            router.push('/onboarding/pretest');
          } else {
            router.push('/onboarding');
          }
        }
      } else {
        router.push('/onboarding');
      }
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, router, session]);

  const handleSignOut = async () => {
    localStorage.removeItem('text2fluent_onboarding');
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem' }}>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="main-layout">
      {/* Permanent Left Panel */}
      <aside className="left-panel animate-fade-in">
        {/* Logo + Brand Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Text2Fluent Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Welcome Darling', cursive", fontSize: '1.5rem', fontWeight: 500, color: 'var(--foreground)', letterSpacing: '0.02em' }}>
            Text2Fluent
          </span>
        </div>
        <h1 style={{ fontSize: '5rem', lineHeight: '1', marginBottom: '1rem' }}>
          Speak your way to fluency
        </h1>
        <p className="platform-description">
          Text2Fluent is an AI-powered platform that helps you build confidence in any language. 
          Read texts aloud, get instant feedback, and improve your fluency step by step.
        </p>

        {status === 'authenticated' && (
          <button 
            onClick={handleSignOut}
            style={{ 
              marginTop: '4rem', 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              cursor: 'pointer', 
              fontWeight: 500,
              fontSize: '1.2rem',
              textAlign: 'left',
              padding: 0
            }}
          >
            ← Sign Out
          </button>
        )}
      </aside>

      {/* Dynamic Right Panel - strictly Auth for Home */}
      <section className="right-panel">
        <div className="animate-fade-in" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <AuthForm />
        </div>
      </section>
    </div>
  );
}

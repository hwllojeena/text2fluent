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
      const data = localStorage.getItem('text2fluent_onboarding');
      if (data) {
        const parsedData = JSON.parse(data);
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
  }, [status, router]);

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

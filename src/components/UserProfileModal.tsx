'use client';

import { useState, useEffect } from 'react';
import { getUserStats, UserStats } from '@/utils/userTracker';
import { useSession, signOut } from '@/components/Providers';

interface UserProfileModalProps {
  onClose: () => void;
}

export default function UserProfileModal({ onClose }: UserProfileModalProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  
  // Account Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      if (session && session.user && (session.user as any).id) {
        const userId = (session.user as any).id;
        const statsData = await getUserStats(userId);
        setStats(statsData);
      }
    };
    fetchStats();
  }, [session]);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setMessage("Please fill all fields.");
      return;
    }
    // Mock successful password change
    localStorage.setItem(`text2fluent_pwd_${session?.user?.email}`, newPassword);
    setMessage("Password updated successfully!");
    setTimeout(() => setMessage(''), 3000);
    setOldPassword('');
    setNewPassword('');
  };

  const handleSignOut = async () => {
    localStorage.removeItem('text2fluent_onboarding');
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      
      <div 
        className="premium-card animate-fade-in scrollbar-hide" 
        style={{ 
          width: '90%', maxWidth: '600px', maxHeight: '85vh', 
          overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column' 
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--foreground)' }}>Your Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>

        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', minWidth: '100px' }}>
              <div style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '0.2rem' }}>🔥</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f97316' }}>{stats?.streak || 0}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Streak</div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>
                {stats?.streak && stats.streak > 0 
                  ? "You're on fire! Keep it up." 
                  : "Complete an exercise to start your streak!"}
              </p>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 600 }}>Name</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '1rem' }}>{session?.user?.name || 'User'}</p>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 600 }}>Email</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--foreground)' }}>{session?.user?.email || 'No email'}</p>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)' }}>Change Password</h3>
            <input 
              type="password" 
              placeholder="Current Password" 
              value={oldPassword} 
              onChange={e => setOldPassword(e.target.value)}
              className="premium-input"
            />
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)}
              className="premium-input"
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.8rem', fontSize: '1rem' }}>Update Password</button>
            {message && <p style={{ color: message.includes('success') ? 'var(--success)' : 'var(--error)', fontSize: '0.9rem', textAlign: 'center' }}>{message}</p>}
          </form>

          <div>
            <button 
              onClick={handleSignOut}
              style={{
                width: '100%', 
                padding: '0.8rem', 
                fontSize: '1rem', 
                color: 'var(--error)', 
                backgroundColor: 'transparent',
                border: '1px solid var(--error)',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = 'var(--error)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--error)';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Lock, Mail, User, Brain, Zap, Award } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('alex.student@edu.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Alex Johnson');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) return;

    if (isRegistering && name) {
      const profile = storageService.getProfile();
      storageService.saveProfile({ ...profile, name, email });
    }

    onLoginSuccess();
  };

  const handleDemoLogin = () => {
    onLoginSuccess();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-app)',
      position: 'relative'
    }}>
      <div className="saas-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '1060px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-medium)',
        overflow: 'hidden'
      }}>
        {/* Left Side: Brand Visual & Feature Highlights */}
        <div style={{
          background: 'var(--bg-sidebar)',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.35)'
              }}>
                🎓
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  StudyMind <span className="badge badge-indigo" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>SaaS 2.0</span>
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>AI-Powered Learning Platform</p>
              </div>
            </div>

            <h1 style={{ fontSize: '2rem', lineHeight: 1.25, marginBottom: '16px' }}>
              Learn Smarter, <br />
              <span style={{ color: 'var(--primary-indigo)' }}>
                Achieve More with AI.
              </span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '36px' }}>
              An intelligent study companion featuring document RAG Q&A, automatic summarization, smart quizzes, personalized study planner, and performance tracking.
            </p>

            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={18} color="var(--primary-indigo)" />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Vector RAG Document Context & Citations</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={18} color="var(--status-success)" />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Auto-Graded Quizzes & Interactive Flashcards</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={18} color="var(--status-warning)" />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Gamification Streaks & Performance Analytics</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--status-success)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Education SaaS • Academic Project Edition</span>
          </div>
        </div>

        {/* Right Side: Student Login Form */}
        <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-card)' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
              {isRegistering ? 'Create Student Account' : 'Welcome Back Student'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isRegistering ? 'Sign up to start organizing your study materials' : 'Sign in to access your study assistant dashboard'}
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {isRegistering && (
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Student Email / Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  placeholder="alex.student@edu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--primary-indigo)' }}
                />
                Remember me
              </label>
              <button type="button" onClick={() => alert('Demo Mode: Click "Sign In" or "One-Click Demo Login" to enter directly.')} className="btn-ghost" style={{ padding: 0, fontSize: '0.85rem', color: 'var(--primary-indigo)' }}>
                Forgot password?
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}>
                {isRegistering ? 'Create Account & Sign In' : 'Sign In to Assistant'} <ArrowRight size={18} />
              </button>

              <button type="button" onClick={handleDemoLogin} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                <Sparkles size={16} color="var(--status-warning)" /> Instant One-Click Demo Login
              </button>
            </div>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              style={{ background: 'none', border: 'none', color: 'var(--primary-indigo)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegistering ? 'Sign In' : 'Register Student Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

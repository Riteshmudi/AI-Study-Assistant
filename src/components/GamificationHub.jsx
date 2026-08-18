import React from 'react';
import { Award, Flame, Zap, CheckCircle2, Lock } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function GamificationHub() {
  const gamification = storageService.getGamification();

  const xpForNextLevel = 500;
  const currentXPInLevel = gamification.totalXP % xpForNextLevel;
  const progressPercent = Math.min((currentXPInLevel / xpForNextLevel) * 100, 100);

  const dailyQuests = [
    { id: 'q1', title: 'Complete 1 AI Practice Quiz', xp: 100, completed: true },
    { id: 'q2', title: 'Ask AI Tutor 2 Study Questions', xp: 30, completed: true },
    { id: 'q3', title: 'Summarize 1 Study Document', xp: 50, completed: false }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Level & XP Overview Banner */}
      <div className="saas-card" style={{ padding: '30px', background: 'var(--gradient-banner)', borderLeft: '4px solid var(--primary-indigo)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.35)'
            }}>
              🏆
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Scholar Level {gamification.level}</h1>
                <span className="badge badge-amber" style={{ fontSize: '0.8rem' }}>
                  <Flame size={14} className="flame-pulse" style={{ marginRight: '4px' }} /> {gamification.streakDays} Day Streak!
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Total XP Earned: <strong style={{ color: '#fbbf24' }}>{gamification.totalXP} XP</strong>
              </p>
            </div>
          </div>

          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span>Level {gamification.level} Progress</span>
              <span>{currentXPInLevel} / {xpForNextLevel} XP</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--gradient-brand)', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Badges Grid */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--status-warning)" /> Unlockable Achievement Badges
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {gamification.badges.map(badge => (
              <div
                key={badge.id}
                className="saas-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  opacity: badge.unlocked ? 1 : 0.45,
                  border: badge.unlocked ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                  background: badge.unlocked ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: badge.unlocked ? 'var(--gradient-brand)' : 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem'
                }}>
                  {badge.icon}
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {badge.title} {!badge.unlocked && <Lock size={12} color="var(--text-dim)" />}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Quests Panel */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--status-success)" /> Daily Study Quests
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dailyQuests.map(quest => (
              <div key={quest.id} style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: quest.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: quest.completed ? '#34d399' : 'white' }}>{quest.title}</h4>
                  <span className="badge badge-emerald" style={{ marginTop: '4px', fontSize: '0.7rem' }}>+{quest.xp} XP</span>
                </div>
                {quest.completed && <CheckCircle2 size={20} color="#10b981" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

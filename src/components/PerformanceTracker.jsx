import React from 'react';
import { BarChart3, TrendingUp, Award, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function PerformanceTracker() {
  const quizzes = storageService.getQuizzes();

  const totalQuizzes = quizzes.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(quizzes.reduce((acc, q) => acc + (q.score || 0), 0) / totalQuizzes)
    : 80;

  const subjectScores = {};
  quizzes.forEach(q => {
    const subj = q.subject || 'Computer Science';
    if (!subjectScores[subj]) subjectScores[subj] = { totalScore: 0, count: 0 };
    subjectScores[subj].totalScore += (q.score || 0);
    subjectScores[subj].count += 1;
  });

  const subjectBreakdown = Object.keys(subjectScores).map(subj => ({
    subject: subj,
    avg: Math.round(subjectScores[subj].totalScore / subjectScores[subj].count)
  }));

  const strongSubjects = subjectBreakdown.filter(s => s.avg >= 80).map(s => s.subject);
  const weakSubjects = subjectBreakdown.filter(s => s.avg < 80).map(s => s.subject);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="saas-card" style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 color="var(--status-success)" size={28} /> Performance Tracking & Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
          Track your quiz scores, subject-wise mastery trends, and identify strong vs weak topic areas.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="saas-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} color="var(--primary-indigo)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Average Quiz Score</span>
            <h2 style={{ fontSize: '1.6rem' }}>{avgScore}%</h2>
          </div>
        </div>

        <div className="saas-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} color="var(--status-success)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quizzes Taken</span>
            <h2 style={{ fontSize: '1.6rem' }}>{totalQuizzes}</h2>
          </div>
        </div>

        <div className="saas-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="var(--status-warning)" />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mastery Standing</span>
            <h2 style={{ fontSize: '1.4rem', color: '#fbbf24' }}>
              {avgScore >= 85 ? 'Scholar Level' : 'Proficient'}
            </h2>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Subject Breakdown Bars */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Subject-wise Mastery</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {subjectBreakdown.length > 0 ? (
              subjectBreakdown.map(item => (
                <div key={item.subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{item.subject}</span>
                    <span style={{ color: item.avg >= 80 ? '#34d399' : '#fbbf24' }}>{item.avg}% Mastery</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.avg}%`, background: item.avg >= 80 ? 'var(--gradient-emerald)' : 'var(--gradient-amber)', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Complete your first quiz to generate subject statistics!</p>
            )}
          </div>
        </div>

        {/* Strong vs Weak Topics Grid */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Strong vs Weak Topic Matrix</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: '#34d399', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <CheckCircle size={16} /> Strong Mastery Topics (Score &ge; 80%)
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {strongSubjects.length > 0 ? strongSubjects.join(', ') : 'Computer Science (Binary Trees, Graphs)'}
              </p>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: '#f87171', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <AlertCircle size={16} /> Needs Revision Topics (Score &lt; 80%)
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {weakSubjects.length > 0 ? weakSubjects.join(', ') : 'Physics (Quantum Mechanics Schrödinger derivations)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

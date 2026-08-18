import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { aiService } from '../services/aiService';

export default function AIRecommendations({ onNavigateTab }) {
  const recommendations = aiService.generateRecommendations();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="saas-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)', borderLeft: '4px solid var(--primary-purple)' }}>
        <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles color="var(--primary-purple)" size={28} /> AI Recommendations & Study Path
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
          Proactive AI analysis identifying your weak topics, upcoming exam deadlines, and daily study priorities.
        </p>
      </div>

      {/* Recommendation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recommendations.map(rec => (
          <div
            key={rec.id}
            className="saas-card saas-card-hover"
            style={{
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: `4px solid ${rec.type === 'urgent' ? '#ef4444' : rec.type === 'revision' ? '#f59e0b' : '#6366f1'}`
            }}
          >
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {rec.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>{rec.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '650px' }}>
                  {rec.desc}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab(rec.tabTarget)}
              className="btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {rec.actionText} <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

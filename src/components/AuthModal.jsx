import React, { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function AuthModal({ isOpen, onClose }) {
  const [profile, setProfile] = useState(storageService.getProfile());
  const [newSubject, setNewSubject] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const avatars = ['🎓', '🚀', '🧠', '⚡', '🦉', '🔬', '💻', '🎨'];

  const handleSave = (e) => {
    e.preventDefault();
    storageService.saveProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const addSubject = () => {
    if (newSubject.trim() && !profile.subjects.includes(newSubject.trim())) {
      setProfile({ ...profile, subjects: [...profile.subjects, newSubject.trim()] });
      setNewSubject('');
    }
  };

  const removeSubject = (subj) => {
    setProfile({ ...profile, subjects: profile.subjects.filter(s => s !== subj) });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="saas-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '30px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            {profile.avatar}
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Student Profile & Preferences</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Personalize your AI study assistant</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Avatar Selector */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Choose Avatar
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {avatars.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setProfile({ ...profile, avatar: emoji })}
                  style={{
                    fontSize: '1.4rem',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: profile.avatar === emoji ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: profile.avatar === emoji ? '2px solid var(--primary-indigo)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Student Name
            </label>
            <input
              type="text"
              className="input-field"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>

          {/* Grade / Target Level */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Academic Grade / Level
            </label>
            <select
              className="input-field"
              value={profile.gradeLevel}
              onChange={(e) => setProfile({ ...profile, gradeLevel: e.target.value })}
            >
              <option value="High School Senior">High School Senior</option>
              <option value="College Freshman / Undergrad">College Freshman / Undergrad</option>
              <option value="College Senior / Undergrad">College Senior / Undergrad</option>
              <option value="Graduate / Master Degree">Graduate / Master Degree</option>
            </select>
          </div>

          {/* Enrolled Subjects */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Enrolled Subjects
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Add subject (e.g. Organic Chemistry)"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
              <button type="button" onClick={addSubject} className="btn-secondary">Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.subjects.map(s => (
                <span key={s} className="badge badge-indigo" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  {s}
                  <button type="button" onClick={() => removeSubject(s)} style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: '6px', cursor: 'pointer' }}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Study Preference */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Learning Style Preference
            </label>
            <select
              className="input-field"
              value={profile.studyPreference}
              onChange={(e) => setProfile({ ...profile, studyPreference: e.target.value })}
            >
              <option value="Visual & Interactive Practice">Visual & Interactive Practice (Quizzes + Diagrams)</option>
              <option value="Socratic Audio & Chatbot">Socratic Audio & Chatbot (Q&A focus)</option>
              <option value="Executive Summaries & Flashcards">Executive Summaries & Flashcards</option>
            </select>
          </div>

          {/* Daily Goal */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Daily Target Study Time (Minutes)
            </label>
            <input
              type="number"
              className="input-field"
              value={profile.dailyGoalMinutes}
              onChange={(e) => setProfile({ ...profile, dailyGoalMinutes: Number(e.target.value) })}
              min={15}
              max={300}
            />
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {savedSuccess ? <><Check size={18} /> Saved!</> : <><Sparkles size={18} /> Update Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Settings, X, Check } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(storageService.getSettings());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
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
        maxWidth: '500px',
        padding: '30px',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Application Settings</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure AI Engine & API Preferences</p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>AI Engine Provider</label>
            <select
              className="input-field"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
            >
              <option value="local_ai">⚡ Intelligent Local AI Engine (Built-in Standalone)</option>
              <option value="openai">🤖 OpenAI GPT-4o API (Requires API Key)</option>
              <option value="gemini">✨ Google Gemini 1.5 Pro API (Requires API Key)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Optional LLM API Key</label>
            <input
              type="password"
              className="input-field"
              placeholder="sk-proj-... or AIzaSy..."
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Leave blank to use the built-in Intelligent Standalone AI Engine.
            </span>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {saved ? <><Check size={18} /> Saved!</> : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

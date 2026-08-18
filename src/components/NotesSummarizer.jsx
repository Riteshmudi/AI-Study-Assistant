import React, { useState } from 'react';
import { FileText, Sparkles, BookOpen, Layers, CheckCircle2, ChevronRight, ChevronLeft, RotateCw } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { gamificationService } from '../services/gamificationService';

export default function NotesSummarizer({ initialDoc }) {
  const materials = storageService.getMaterials();
  const [selectedDocId, setSelectedDocId] = useState(initialDoc ? initialDoc.id : (materials[0]?.id || ''));
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const selectedDoc = materials.find(m => m.id === selectedDocId);

  const handleGenerateSummary = async () => {
    if (!selectedDoc) return;
    setLoading(true);
    try {
      const res = await aiService.summarizeNotes(selectedDoc.extractedText, selectedDoc.title);
      setSummaryData(res);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      
      // Reward XP for summarizing notes
      gamificationService.addXP(30, 'Summarized Study Material');
      gamificationService.unlockBadge('summarizer_pro');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Selector Panel */}
      <div className="saas-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText color="var(--status-warning)" size={28} /> AI Notes Summarizer & Flashcards
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Transform long study notes and lecture PDFs into key takeaways, definitions, and active recall flashcards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="input-field"
            style={{ width: '260px' }}
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              setSummaryData(null);
            }}
          >
            {materials.map(m => (
              <option key={m.id} value={m.id}>📄 {m.title}</option>
            ))}
          </select>

          <button
            onClick={handleGenerateSummary}
            disabled={loading || !selectedDoc}
            className="btn-primary"
          >
            <Sparkles size={18} /> {loading ? 'Generating...' : 'Summarize & Build Flashcards'}
          </button>
        </div>
      </div>

      {/* Main Results View */}
      {summaryData ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {/* Left Column: Summary & Takeaways */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Executive Summary */}
            <div className="saas-card" style={{ padding: '24px', borderLeft: '4px solid var(--primary-indigo)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="var(--primary-indigo)" /> Executive Summary
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
                {summaryData.executiveSummary}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="saas-card" style={{ padding: '24px', borderLeft: '4px solid var(--status-success)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="var(--status-success)" /> Key Points & Takeaways
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {summaryData.keyTakeaways.map((point, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <span className="badge badge-indigo" style={{ marginTop: '2px' }}>#{idx + 1}</span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Definitions */}
            {summaryData.importantDefinitions && (
              <div className="saas-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={20} color="var(--status-info)" /> Important Concepts & Definitions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {summaryData.importantDefinitions.map((def, idx) => (
                    <div key={idx} style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ color: 'var(--status-info)', fontSize: '0.95rem', marginBottom: '4px' }}>{def.term}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{def.def}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 3D Interactive Flashcard Player */}
          <div className="saas-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Active Recall Flashcards</h3>
                <span className="badge badge-amber">
                  Card {currentCardIdx + 1} of {summaryData.generatedFlashcards.length}
                </span>
              </div>

              {/* 3D Flip Card Element */}
              <div className="perspective-container" style={{ height: '250px', width: '100%', cursor: 'pointer' }} onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                  <div className="flip-card-front" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Question (Click to flip)
                    </span>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white', textAlign: 'center' }}>
                      {summaryData.generatedFlashcards[currentCardIdx]?.question}
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <RotateCw size={14} /> Tap to see answer
                    </div>
                  </div>

                  <div className="flip-card-back" style={{ background: 'var(--gradient-brand)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#e0e7ff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Answer (Click to flip back)
                    </span>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white', textAlign: 'center' }}>
                      {summaryData.generatedFlashcards[currentCardIdx]?.answer}
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                      <RotateCw size={14} /> Tap to see question
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button
                disabled={currentCardIdx === 0}
                onClick={() => { setCurrentCardIdx(prev => prev - 1); setIsFlipped(false); }}
                className="btn-secondary"
              >
                <ChevronLeft size={18} /> Prev
              </button>
              <button
                disabled={currentCardIdx === summaryData.generatedFlashcards.length - 1}
                onClick={() => { setCurrentCardIdx(prev => prev + 1); setIsFlipped(false); }}
                className="btn-primary"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="saas-card" style={{ padding: '60px', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Select a study document above</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 20px auto' }}>
            Click "Summarize & Build Flashcards" to extract core definitions, takeaways, and active recall study cards automatically.
          </p>
        </div>
      )}
    </div>
  );
}

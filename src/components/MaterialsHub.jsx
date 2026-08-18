import React, { useState } from 'react';
import { Upload, FileText, Trash2, Eye, Sparkles, BookOpen, CheckCircle2, FileCode } from 'lucide-react';
import { storageService } from '../services/storageService';
import { gamificationService } from '../services/gamificationService';
import { apiService } from '../services/apiService';

export default function MaterialsHub({ onSelectDocForQuiz, onSelectDocForChat, onSelectDocForSummary }) {
  const [materials, setMaterials] = useState(storageService.getMaterials());
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  
  // Upload form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const profile = storageService.getProfile();
  const subjects = ['All', ...new Set([...profile.subjects, ...materials.map(m => m.subject)])];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTitle(file.name.replace(/\.[^/.]+$/, ""));
    setNotesContent(file);
  };

  const handleCreateDoc = async (e) => {
    e.preventDefault();
    if (!title || !notesContent) return;

    try {
      let newDoc;

      if (notesContent instanceof File) {
        newDoc = await apiService.uploadMaterial({
          file: notesContent,
          title,
          subject,
          topic: topic || 'General Notes'
        });
      } else {
        // Manual text-note fallback.
        newDoc = {
          id: 'doc-' + Date.now(),
          title,
          subject,
          topic: topic || 'General Notes',
          fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.txt`,
          uploadedAt: new Date().toISOString(),
          fileSize: `${Math.max(1, Math.round(String(notesContent).length / 1024))} KB`,
          extractedText: String(notesContent)
        };
      }

      const updated = storageService.addMaterial(newDoc);
      setMaterials(updated);
      gamificationService.addXP(50, 'Uploaded Study Material');

      setTitle('');
      setTopic('');
      setNotesContent('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch (error) {
      console.error(error);
      alert(`Upload failed: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteMaterial(id);
    } catch (error) {
      console.warn('Backend delete failed; removing from local cache:', error.message);
    }

    const updated = storageService.deleteMaterial(id);
    setMaterials(updated);
  };

  const filteredMaterials = selectedSubject === 'All' 
    ? materials 
    : materials.filter(m => m.subject === selectedSubject);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="saas-card" style={{ padding: '28px', background: 'var(--gradient-banner)', borderLeft: '4px solid var(--primary-indigo)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BookOpen color="var(--primary-indigo)" size={28} /> Study Material Hub
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.92rem' }}>
              Upload notes & PDFs to organize by subject, inspect extracted text, and power instant RAG AI Q&A.
            </p>
          </div>
          <div className="badge badge-indigo" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            <Sparkles size={14} style={{ marginRight: '4px' }} /> +50 XP per Upload
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Left Column: Material Cards & List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Subject Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={selectedSubject === s ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '6px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Materials Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
            {filteredMaterials.map(doc => (
              <div key={doc.id} className="saas-card saas-card-hover" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '230px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{doc.subject}</span>
                    <button onClick={() => handleDelete(doc.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Delete material">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', lineHeight: 1.3, color: 'var(--text-main)' }}>{doc.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doc.topic}</p>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{doc.fileSize}</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    <button onClick={() => setActivePreviewDoc(doc)} className="btn-secondary" style={{ padding: '6px', fontSize: '0.75rem', justifyContent: 'center' }}>
                      <Eye size={13} /> View
                    </button>
                    <button onClick={() => onSelectDocForSummary(doc)} className="btn-secondary" style={{ padding: '6px', fontSize: '0.75rem', justifyContent: 'center' }}>
                      <Sparkles size={13} /> Summary
                    </button>
                    <button onClick={() => onSelectDocForChat(doc)} className="btn-primary" style={{ padding: '6px', fontSize: '0.75rem', justifyContent: 'center' }}>
                      RAG Q&A
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upload Notes Form Panel */}
        <div className="saas-card" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Upload size={18} color="var(--primary-indigo)" /> Upload / Add Notes
          </h3>

          <form onSubmit={handleCreateDoc} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--bg-app)'
            }}>
              <FileCode size={28} color="var(--primary-indigo)" style={{ marginBottom: '6px' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>Choose PDF or TXT File</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-indexes content for RAG Q&A</p>
              <input type="file" accept=".txt,.md,.pdf,.doc" onChange={handleFileUpload} style={{ marginTop: '8px', fontSize: '0.8rem', width: '100%' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Document Title</label>
              <input type="text" className="input-field" placeholder="e.g. Organic Chemistry Reactions" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Subject</label>
              <select className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {profile.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Topic</label>
              <input type="text" className="input-field" placeholder="e.g. Nucleophilic Substitution" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Extracted Text Content</label>
              <textarea className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Paste lecture notes here, or select a PDF/text file above..." value={notesContent instanceof File ? '' : notesContent} onChange={(e) => setNotesContent(e.target.value)} required />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {uploadSuccess ? <><CheckCircle2 size={18} /> Uploaded & Indexed!</> : <><Sparkles size={18} /> Save & Index Material</>}
            </button>
          </form>
        </div>
      </div>

      {/* Document View Preview Modal */}
      {activePreviewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="saas-card animate-fade-in" style={{ width: '100%', maxWidth: '700px', maxHeight: '80vh', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-indigo">{activePreviewDoc.subject}</span>
                <h2 style={{ fontSize: '1.3rem', marginTop: '4px' }}>{activePreviewDoc.title}</h2>
              </div>
              <button onClick={() => setActivePreviewDoc(null)} className="btn-secondary" style={{ padding: '6px 12px' }}>Close</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.6, border: '1px solid var(--border-subtle)' }}>
              {activePreviewDoc.extractedText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

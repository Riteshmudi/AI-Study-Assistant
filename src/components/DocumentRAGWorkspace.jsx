import React, { useState } from 'react';
import { Search, FileText, ChevronRight } from 'lucide-react';
import { ragService } from '../services/ragService';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';

export default function DocumentRAGWorkspace({ onOpenChatWithDoc }) {
  const materials = storageService.getMaterials();
  const [query, setQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const results = await apiService.ragSearch({
        query,
        materials,
        targetDocId: selectedDocId === 'all' ? null : selectedDocId,
        topK: 5
      });
      setSearchResults(results);
    } catch (error) {
      console.warn('Backend RAG unavailable; using local retrieval:', error.message);
      const results = ragService.searchRelevantChunks(
        query,
        materials,
        selectedDocId === 'all' ? null : selectedDocId,
        5
      );
      setSearchResults(results);
    }

    setHasSearched(true);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="saas-card" style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search color="var(--primary-indigo)" size={28} /> Document-Based Q&A (RAG System)
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
          Query your uploaded notes with vector retrieval. The system fetches exact paragraphs with citations to reduce hallucinations.
        </p>
      </div>

      {/* RAG Search Form */}
      <div className="saas-card" style={{ padding: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search concepts across your notes (e.g. Dijkstra min-heap, Born rule, BST AVL height)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div style={{ width: '240px' }}>
            <select className="input-field" value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)}>
              <option value="all">🌐 All Uploaded Notes</option>
              {materials.map(m => <option key={m.id} value={m.id}>📄 {m.title}</option>)}
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
            <Search size={18} /> RAG Vector Retrieval
          </button>
        </form>
      </div>

      {/* Search Results Display */}
      {hasSearched && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
            Retrieval Results ({searchResults.length} relevant chunks found)
          </h3>

          {searchResults.length > 0 ? (
            searchResults.map((chunk, idx) => (
              <div key={chunk.id || idx} className="saas-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary-indigo)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="var(--primary-indigo)" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{chunk.docTitle}</span>
                  </div>
                  <span className="badge badge-emerald">
                    {chunk.relevancePercentage}% Vector Match
                  </span>
                </div>

                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
                  "{chunk.content}"
                </p>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => onOpenChatWithDoc(chunk.docId)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    Ask AI Tutor About This Section <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="saas-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No exact vector matches found for "{query}". Try broadening your query terms.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

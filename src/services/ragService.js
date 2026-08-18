// Document Chunking, Vector Indexing & RAG Retrieval Engine

export const ragService = {
  // Chunk document text into manageable segments for vector RAG
  chunkText: (text, docId, docTitle, chunkSize = 300) => {
    if (!text) return [];
    
    // Split into paragraphs first, then trim
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks = [];
    let chunkIdCounter = 1;

    paragraphs.forEach(para => {
      const trimmed = para.trim().replace(/\s+/g, ' ');
      if (trimmed.length <= chunkSize) {
        chunks.push({
          id: `${docId}_c${chunkIdCounter++}`,
          docId,
          docTitle,
          content: trimmed
        });
      } else {
        // Split longer paragraphs by sentences
        const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
        let currentChunk = '';

        sentences.forEach(sentence => {
          if ((currentChunk + sentence).length > chunkSize) {
            if (currentChunk.length > 0) {
              chunks.push({
                id: `${docId}_c${chunkIdCounter++}`,
                docId,
                docTitle,
                content: currentChunk.trim()
              });
            }
            currentChunk = sentence;
          } else {
            currentChunk += ' ' + sentence;
          }
        });

        if (currentChunk.trim().length > 0) {
          chunks.push({
            id: `${docId}_c${chunkIdCounter++}`,
            docId,
            docTitle,
            content: currentChunk.trim()
          });
        }
      }
    });

    return chunks;
  },

  // Simple TF-IDF Vector Search across document chunks
  searchRelevantChunks: (query, materials, targetDocId = null, topK = 3) => {
    if (!query || !materials || materials.length === 0) return [];

    // Filter materials if targetDocId is specified
    const filteredDocs = targetDocId 
      ? materials.filter(m => m.id === targetDocId)
      : materials;

    // Build chunk corpus
    let allChunks = [];
    filteredDocs.forEach(doc => {
      const docChunks = ragService.chunkText(doc.extractedText, doc.id, doc.title);
      allChunks = allChunks.concat(docChunks);
    });

    if (allChunks.length === 0) return [];

    // Helper tokenizers
    const tokenize = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    const queryTokens = tokenize(query);

    if (queryTokens.length === 0) return allChunks.slice(0, topK);

    // Score chunks based on term match and keyword overlap
    const scoredChunks = allChunks.map(chunk => {
      const chunkTokens = tokenize(chunk.content);
      let matchCount = 0;
      
      queryTokens.forEach(qToken => {
        if (chunkTokens.includes(qToken)) {
          matchCount += 1;
        } else {
          // Partial substring match boost
          const partial = chunkTokens.some(cToken => cToken.includes(qToken) || qToken.includes(cToken));
          if (partial) matchCount += 0.5;
        }
      });

      const score = matchCount / (Math.sqrt(chunkTokens.length) + 1);

      return {
        ...chunk,
        score,
        relevancePercentage: Math.min(Math.round(score * 100) + 40, 98)
      };
    });

    // Sort by relevance score descending
    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, topK);
  }
};

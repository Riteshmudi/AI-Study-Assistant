const API_BASE = '/api';

async function request(path, options = {}) {
  const config = {
    ...options,
    headers: {
      ...(options.headers || {})
    }
  };

  if (config.body && !(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, config);

    const contentType = response.headers.get('content-type') || '';

    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof data === 'object' && data?.message
          ? data.message
          : typeof data === 'object' && data?.error
            ? data.error
            : `Request failed (${response.status})`;

      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error(`API Error: ${API_BASE}${path}`, error);
    throw error;
  }
}

export const apiService = {
  // ===============================
  // HEALTH CHECK
  // ===============================

  health: () => request('/health'),

  // ===============================
  // AI CHAT
  // ===============================

  chat: (payload) =>
    request('/chat', {
      method: 'POST',
      body: payload
    }),

  // ===============================
  // AI SUMMARIZER
  // ===============================

  summarize: (payload) =>
    request('/summarize', {
      method: 'POST',
      body: payload
    }),

  // ===============================
  // QUIZ GENERATOR
  // ===============================

  generateQuiz: (payload) =>
    request('/quiz', {
      method: 'POST',
      body: payload
    }),

  // ===============================
  // STUDY PLAN
  // ===============================

  generateStudyPlan: (payload) =>
    request('/study-plan', {
      method: 'POST',
      body: payload
    }),

  // ===============================
  // AI RECOMMENDATIONS
  // ===============================

  getRecommendations: (payload) =>
    request('/recommendations', {
      method: 'POST',
      body: payload
    }),

  // ===============================
  // RAG SEARCH
  // ===============================

  ragSearch: (payload) =>
    request('/rag/search', {
      method: 'POST',
      body: payload
    }),

  // ===============================
  // MATERIAL UPLOAD
  // ===============================

  uploadMaterial: async ({ file, title, subject, topic }) => {
    const form = new FormData();

    form.append('file', file);
    form.append(
      'title',
      title || file.name.replace(/\.[^/.]+$/, '')
    );
    form.append(
      'subject',
      subject || 'Computer Science'
    );
    form.append(
      'topic',
      topic || 'General Notes'
    );

    return request('/materials/upload', {
      method: 'POST',
      body: form
    });
  },

  // ===============================
  // DELETE MATERIAL
  // ===============================

  deleteMaterial: (id) =>
    request(`/materials/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),

  // ===============================
  // QUIZ RESULT
  // ===============================

  requestQuizResult: (result) =>
    request('/quizzes/results', {
      method: 'POST',
      body: result
    })
};
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));

async function ensureDb() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({
      materials: [],
      quizResults: [],
      planner: [],
      chatLogs: []
    }, null, 2));
  }
}

async function readDb() {
  await ensureDb();
  return JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
}

async function writeDb(db) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

function chunkText(text, chunkSize = 500) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length > chunkSize && current) {
      chunks.push(current.trim());
      current = sentence.trim();
    } else {
      current = `${current} ${sentence}`.trim();
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

function searchChunks(query, materials = [], targetDocId = null, topK = 5) {
  const docs = targetDocId ? materials.filter(m => m.id === targetDocId) : materials;
  const qTokens = tokenize(query);
  const chunks = [];

  for (const doc of docs) {
    for (const content of chunkText(doc.extractedText)) {
      const tokens = tokenize(content);
      let matches = 0;
      for (const q of qTokens) {
        if (tokens.includes(q)) matches += 1;
        else if (tokens.some(t => t.includes(q) || q.includes(t))) matches += 0.5;
      }
      const score = matches / (Math.sqrt(tokens.length) + 1);
      chunks.push({
        id: `${doc.id}-${chunks.length}`,
        docId: doc.id,
        docTitle: doc.title,
        content,
        score,
        relevancePercentage: Math.min(98, Math.max(0, Math.round(score * 100)))
      });
    }
  }

  return chunks.sort((a, b) => b.score - a.score).slice(0, topK);
}

async function callAI(messages) {
  const baseUrl = process.env.AI_BASE_URL?.trim();
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();

  if (!baseUrl || !model) return null;

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages
    })
  });

  if (!response.ok) {
    throw new Error(`AI provider returned ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

function parseJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
    }
    return null;
  }
}

function fallbackChat({ userMessage, persona, materials, targetDocId }) {
  const matches = searchChunks(userMessage, materials, targetDocId, 3);
  const tone = {
    socratic: 'I will guide you with questions and concise explanations.',
    eli5: 'I will explain the idea in simple language with an easy analogy.',
    examiner: 'I will focus on precise definitions, important points and exam-style wording.'
  }[persona] || 'I am your AI Study Tutor.';

  if (matches.length && matches[0].relevancePercentage > 0) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: `${tone}\n\n**Answer from your notes:**\n\n${matches[0].content}\n\n**Source:** ${matches[0].docTitle}`,
      persona,
      citations: matches.map(item => ({
        docTitle: item.docTitle,
        content: item.content,
        score: item.relevancePercentage
      })),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'ai',
    text: `${tone}\n\nI could not find a relevant section in the uploaded notes. Try a more specific question or upload the related material first.`,
    persona,
    citations: [],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function fallbackSummary(documentText, documentTitle) {
  const sentences = String(documentText || '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const keyTakeaways = sentences.slice(0, 6);
  return {
    title: documentTitle,
    executiveSummary: keyTakeaways.slice(0, 3).join(' ') || `Study notes for ${documentTitle}.`,
    keyTakeaways: keyTakeaways.length ? keyTakeaways : [`Review the main concepts from ${documentTitle}.`],
    importantDefinitions: [],
    generatedFlashcards: [
      {
        question: `What is the main focus of ${documentTitle}?`,
        answer: keyTakeaways[0] || 'The main concepts contained in the uploaded study material.'
      },
      {
        question: 'What is a good way to revise this material?',
        answer: 'Use active recall, practice questions and spaced repetition.'
      }
    ]
  };
}

function fallbackQuiz({ subject, topic, difficulty, questionCount }) {
  const bank = [
    {
      type: 'mcq',
      question: `Which statement best describes the study topic "${topic}"?`,
      options: [
        `It is a core concept within ${subject}.`,
        'It is unrelated to the subject.',
        'It cannot be tested.',
        'It has no practical use.'
      ],
      correctIndex: 0,
      explanation: `${topic} is the selected target for this practice quiz.`
    },
    {
      type: 'true_false',
      question: 'Spaced repetition can improve long-term retention.',
      options: ['True', 'False'],
      correctIndex: 0,
      explanation: 'Spaced review strengthens retrieval over increasing intervals.'
    },
    {
      type: 'mcq',
      question: 'What should you do after getting a quiz question wrong?',
      options: ['Review the explanation', 'Ignore it', 'Delete the quiz', 'Skip the topic forever'],
      correctIndex: 0,
      explanation: 'Mistake analysis helps identify weak areas for targeted revision.'
    },
    {
      type: 'mcq',
      question: 'Which factor should have high priority in a study plan?',
      options: ['An upcoming exam', 'A random task', 'No deadline', 'An unrelated activity'],
      correctIndex: 0,
      explanation: 'Upcoming assessments should normally receive appropriate priority.'
    },
    {
      type: 'mcq',
      question: 'Which approach best supports active recall?',
      options: ['Answering questions without looking at notes', 'Reading the same page repeatedly', 'Avoiding practice', 'Skipping feedback'],
      correctIndex: 0,
      explanation: 'Active recall asks you to retrieve information from memory.'
    }
  ];

  const count = Math.max(1, Math.min(Number(questionCount) || 4, bank.length));
  const questions = bank.slice(0, count).map((q, i) => ({
    ...q,
    id: `q_${Date.now()}_${i}`
  }));

  return {
    id: `quiz_${Date.now()}`,
    title: `${subject} - ${topic} Practice Quiz`,
    subject,
    topic,
    difficulty,
    totalQuestions: questions.length,
    questions,
    createdAt: new Date().toISOString()
  };
}

app.get('/api/health', async (_req, res) => {
  res.json({
    ok: true,
    service: 'AI Study Assistant backend',
    aiProviderConfigured: Boolean(process.env.AI_BASE_URL && process.env.AI_MODEL)
  });
});

app.post('/api/ai/chat', async (req, res) => {
  const { userMessage, history = [], persona = 'socratic', targetDocId = null, materials = [] } = req.body || {};
  if (!userMessage?.trim()) return res.status(400).json({ error: 'userMessage is required' });

  const matches = searchChunks(userMessage, materials, targetDocId, 3);
  const context = matches.map(m => `[${m.docTitle}]\n${m.content}`).join('\n\n');

  try {
    const aiText = await callAI([
      {
        role: 'system',
        content: `You are an AI study tutor. Persona: ${persona}. Use the supplied study context when relevant. If context does not answer the question, clearly say so. Do not invent citations.\n\nSTUDY CONTEXT:\n${context || 'No matching document context.'}`
      },
      ...history.slice(-8).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: userMessage }
    ]);

    if (aiText) {
      return res.json({
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        persona,
        citations: matches.map(m => ({
          docTitle: m.docTitle,
          content: m.content,
          score: m.relevancePercentage
        })),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  } catch (error) {
    console.error('AI provider error:', error.message);
  }

  res.json(fallbackChat({ userMessage, persona, materials, targetDocId }));
});

app.post('/api/ai/summarize', async (req, res) => {
  const { documentText = '', documentTitle = 'Study Notes' } = req.body || {};
  if (!documentText.trim()) return res.status(400).json({ error: 'documentText is required' });

  try {
    const aiText = await callAI([
      {
        role: 'system',
        content: 'Summarize study notes. Return ONLY valid JSON with keys: title, executiveSummary, keyTakeaways (array), importantDefinitions (array of {term,def}), generatedFlashcards (array of {question,answer}).'
      },
      { role: 'user', content: `Title: ${documentTitle}\n\nNotes:\n${documentText.slice(0, 50000)}` }
    ]);
    const parsed = parseJson(aiText);
    if (parsed?.executiveSummary && Array.isArray(parsed.keyTakeaways)) return res.json(parsed);
  } catch (error) {
    console.error('AI summary error:', error.message);
  }

  res.json(fallbackSummary(documentText, documentTitle));
});

app.post('/api/ai/quiz', async (req, res) => {
  const {
    subject = 'Computer Science',
    topic = 'General',
    difficulty = 'Medium',
    questionCount = 4,
    documentText = '',
    documentTitle = ''
  } = req.body || {};

  try {
    const aiText = await callAI([
      {
        role: 'system',
        content: 'Generate an academic multiple-choice quiz. Return ONLY valid JSON: {id,title,subject,topic,difficulty,totalQuestions,questions}. Each question must have id,type,question,options,correctIndex,explanation. Do not include answers outside correctIndex.'
      },
      {
        role: 'user',
        content: `Subject: ${subject}\nTopic: ${topic}\nDifficulty: ${difficulty}\nQuestion count: ${questionCount}\nSource document: ${documentTitle}\nSource text:\n${documentText.slice(0, 40000)}`
      }
    ]);
    const parsed = parseJson(aiText);
    if (parsed?.questions?.length) {
      parsed.questions = parsed.questions.slice(0, Number(questionCount) || 4);
      parsed.totalQuestions = parsed.questions.length;
      parsed.id ||= `quiz_${Date.now()}`;
      parsed.createdAt ||= new Date().toISOString();
      return res.json(parsed);
    }
  } catch (error) {
    console.error('AI quiz error:', error.message);
  }

  res.json(fallbackQuiz({ subject, topic, difficulty, questionCount }));
});

app.post('/api/rag/search', (req, res) => {
  const { query, materials = [], targetDocId = null, topK = 5 } = req.body || {};
  if (!query?.trim()) return res.status(400).json({ error: 'query is required' });
  res.json(searchChunks(query, materials, targetDocId, topK));
});

app.post('/api/materials/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'A file is required' });

  const title = req.body.title || req.file.originalname.replace(/\.[^/.]+$/, '');
  const subject = req.body.subject || 'Computer Science';
  const topic = req.body.topic || 'General Notes';

  let extractedText = '';
  const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    const parsed = await pdfParse(req.file.buffer);
    extractedText = parsed.text || '';
  } else {
    extractedText = req.file.buffer.toString('utf8');
  }

  if (!extractedText.trim()) {
    return res.status(422).json({ error: 'Could not extract readable text from this file.' });
  }

  const material = {
    id: `doc-${Date.now()}`,
    title,
    subject,
    topic,
    fileName: req.file.originalname,
    uploadedAt: new Date().toISOString(),
    fileSize: `${Math.max(1, Math.round(req.file.size / 1024))} KB`,
    extractedText
  };

  const db = await readDb();
  db.materials.unshift(material);
  await writeDb(db);

  res.status(201).json(material);
});

app.delete('/api/materials/:id', async (req, res) => {
  const db = await readDb();
  db.materials = db.materials.filter(item => item.id !== req.params.id);
  await writeDb(db);
  res.json({ ok: true });
});

app.post('/api/quizzes/results', async (req, res) => {
  const db = await readDb();
  db.quizResults.unshift({ ...req.body, savedAt: new Date().toISOString() });
  await writeDb(db);
  res.status(201).json(req.body);
});

app.get('/api/analytics', async (_req, res) => {
  const db = await readDb();
  const quizzes = db.quizResults || [];
  const averageScore = quizzes.length
    ? Math.round(quizzes.reduce((sum, q) => sum + Number(q.score || 0), 0) / quizzes.length)
    : 0;

  res.json({
    totalQuizzes: quizzes.length,
    averageScore,
    subjectScores: quizzes.reduce((acc, q) => {
      const subject = q.subject || 'General';
      acc[subject] ||= { total: 0, count: 0 };
      acc[subject].total += Number(q.score || 0);
      acc[subject].count += 1;
      return acc;
    }, {})
  });
});

const PORT = Number(process.env.PORT || 5000);
ensureDb().then(() => {
  app.listen(PORT, () => {
    console.log(`AI Study Assistant backend running on http://localhost:${PORT}`);
  });
});

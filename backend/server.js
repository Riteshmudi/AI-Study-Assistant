const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// OPENROUTER CLIENT
// ===============================

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('WARNING: OPENROUTER_API_KEY is not set in .env');
}

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ===============================
// ROOT
// ===============================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Study Assistant Backend is running!',
    status: 'online'
  });
});

// ===============================
// HEALTH CHECK
// ===============================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API is working',
    timestamp: new Date().toISOString()
  });
});

// ===============================
// AI CHAT - OPENROUTER
// ===============================

app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      persona = 'socratic',
      document = null
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const personaInstructions = {
      socratic:
        'Act as a Socratic tutor. Guide the student step by step instead of simply giving the answer. Ask useful questions when appropriate.',

      eli5:
        'Explain everything in extremely simple language using easy examples and analogies, as if explaining to a beginner.',

      examiner:
        'Act as a strict examiner. Give precise definitions, important points, formulas, examples and exam-focused explanations.'
    };

    const systemPrompt =
      personaInstructions[persona] ||
      personaInstructions.socratic;

    const messages = [
      {
        role: 'system',
        content:
          `You are an AI Study Assistant. ${systemPrompt} ` +
          `Always be helpful, accurate and educational.`
      }
    ];

    // Previous conversation
    if (Array.isArray(history)) {
      history.slice(-10).forEach((item) => {
        if (item?.sender === 'user' && item?.text) {
          messages.push({
            role: 'user',
            content: item.text
          });
        } else if (item?.sender === 'ai' && item?.text) {
          messages.push({
            role: 'assistant',
            content: item.text
          });
        }
      });
    }

    // Selected document context
    if (document?.extractedText) {
      messages.push({
        role: 'system',
        content:
          `The student has selected this study document:\n\n` +
          `${document.title || 'Study Document'}\n\n` +
          `${document.extractedText.substring(0, 12000)}`
      });
    }

    messages.push({
      role: 'user',
      content: message
    });

    const completion = await openrouter.chat.completions.create({
      model: 'openrouter/free',
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    res.json({
      success: true,
      reply,
      persona
    });
  } catch (error) {
    console.error('OpenRouter Chat Error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process chat request'
    });
  }
});

// ===============================
// AI SUMMARIZER
// ===============================

app.post('/api/summarize', async (req, res) => {
  try {
    const {
      text,
      title = 'Study Notes'
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const completion = await openrouter.chat.completions.create({
      model: 'openrouter/free',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI study notes summarizer. Return concise and useful study material.'
        },
        {
          role: 'user',
          content:
            `Summarize the following study notes.\n\n` +
            `Title: ${title}\n\n` +
            text.substring(0, 20000)
        }
      ],
      temperature: 0.4,
      max_tokens: 1500
    });

    const aiText =
      completion.choices?.[0]?.message?.content ||
      text.substring(0, 700);

    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    const keyTakeaways = sentences.slice(0, 6);

    const generatedFlashcards = keyTakeaways
      .slice(0, 5)
      .map((sentence, index) => ({
        question: `What is an important point from ${title} - Topic ${index + 1}?`,
        answer: sentence
      }));

    if (generatedFlashcards.length === 0) {
      generatedFlashcards.push({
        question: `What is the main focus of ${title}?`,
        answer: text.substring(0, 300)
      });
    }

    res.json({
      success: true,
      title,
      executiveSummary: aiText,
      summary: aiText,
      keyTakeaways:
        keyTakeaways.length > 0
          ? keyTakeaways
          : [text.substring(0, 300)],
      importantDefinitions: [],
      generatedFlashcards,
      message: 'Study material summarized successfully'
    });
  } catch (error) {
    console.error('OpenRouter Summarizer Error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to summarize text'
    });
  }
});

// ===============================
// QUIZ GENERATOR
// ===============================

app.post('/api/quiz', async (req, res) => {
  try {
    const {
      topic,
      subject = 'Computer Science',
      questionCount = 5,
      numberOfQuestions,
      difficulty = 'Medium'
    } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const total = Math.min(
      Math.max(
        Number(questionCount || numberOfQuestions) || 5,
        1
      ),
      10
    );

    const completion = await openrouter.chat.completions.create({
      model: 'openrouter/free',
      messages: [
        {
          role: 'system',
          content:
            `You are an expert quiz generator for students.

Return ONLY valid JSON in this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "question",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "explanation"
    }
  ]
}

Generate exactly ${total} questions.
Difficulty: ${difficulty}.
Subject: ${subject}.
Topic: ${topic}.`
        },
        {
          role: 'user',
          content: `Generate a ${difficulty} practice quiz on ${topic}.`
        }
      ],
      temperature: 0.5,
      max_tokens: 2500
    });

    const raw =
      completion.choices?.[0]?.message?.content || '';

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI returned invalid quiz JSON');
      }
    }

    const questions = (parsed.questions || []).map((q, index) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${index + 1}`,
      difficulty
    }));

    res.json({
      success: true,
      subject,
      topic,
      difficulty,
      totalQuestions: questions.length,
      questions
    });
  } catch (error) {
    console.error('OpenRouter Quiz Error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate quiz'
    });
  }
});

// ===============================
// STUDY PLAN
// ===============================

app.post('/api/study-plan', async (req, res) => {
  try {
    const {
      subjects = [],
      dailyMinutes = 60
    } = req.body;

    const plan = subjects.map((subject, index) => ({
      id: `plan-${Date.now()}-${index}`,
      subject,
      duration: Number(dailyMinutes) || 60,
      priority: index === 0 ? 'High' : 'Medium'
    }));

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Study Plan Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create study plan'
    });
  }
});

// ===============================
// RECOMMENDATIONS
// ===============================

app.post('/api/recommendations', async (req, res) => {
  try {
    const {
      subjects = [],
      weakTopics = []
    } = req.body;

    res.json({
      success: true,
      recommendations: [
        {
          id: 1,
          title: 'Review Weak Topics',
          description:
            weakTopics.length
              ? `Focus on: ${weakTopics.join(', ')}`
              : 'Review your recently studied topics.',
          type: 'revision'
        },
        {
          id: 2,
          title: 'Practice Quiz',
          description:
            'Take a short practice quiz to improve retention.',
          type: 'quiz'
        },
        {
          id: 3,
          title: 'Study Session',
          description:
            subjects.length
              ? `Continue studying ${subjects[0]}.`
              : 'Start a focused study session.',
          type: 'study'
        }
      ]
    });
  } catch (error) {
    console.error('Recommendation Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations'
    });
  }
});

// ===============================
// 404
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((error, req, res, next) => {
  console.error('Server Error:', error);

  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log('');
  console.log('======================================');
  console.log(' AI STUDY ASSISTANT BACKEND');
  console.log('======================================');
  console.log(` Server: http://localhost:${PORT}`);
  console.log(` API:    http://localhost:${PORT}/api/health`);
  console.log(' AI:     OpenRouter');
  console.log(' Status: ONLINE');
  console.log('======================================');
  console.log('');
});


import { apiService } from './apiService';
import { ragService } from './ragService';
import { storageService } from './storageService';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function localChatFallback(userMessage, history = [], persona = 'socratic', targetDocId = null) {
  const materials = storageService.getMaterials();
  const chunks = ragService.searchRelevantChunks(userMessage, materials, targetDocId, 3);
  const tone = {
    socratic: 'As your Socratic Study Assistant, I will guide you toward the answer.',
    eli5: 'I will explain this in very simple language with an easy analogy.',
    examiner: 'I will answer like a strict examiner, focusing on definitions, formulas and exam points.'
  }[persona] || 'I am your AI Study Assistant.';

  if (chunks.length) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: `${tone}\n\n**Answer from your notes:**\n\n${chunks[0].content}\n\n**Source:** ${chunks[0].docTitle}`,
      persona,
      citations: chunks.map(c => ({
        docTitle: c.docTitle,
        content: c.content,
        score: c.relevancePercentage
      })),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'ai',
    text: `${tone}\n\nI could not find a matching section in your uploaded notes. Try uploading the relevant chapter or ask a more specific question.`,
    persona,
    citations: [],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function localSummaryFallback(documentText, documentTitle) {
  const sentences = String(documentText || '')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const keyTakeaways = sentences.slice(0, 6);
  const first = keyTakeaways[0] || `Core concepts from ${documentTitle}.`;

  return {
    title: documentTitle,
    executiveSummary: `${documentTitle} contains study material that can be reviewed through its main definitions, principles and examples. The summary below is generated from the uploaded text.`,
    keyTakeaways: keyTakeaways.length ? keyTakeaways : [first],
    importantDefinitions: [],
    generatedFlashcards: [
      { question: `What is the main focus of ${documentTitle}?`, answer: first },
      { question: 'What should you do after reviewing these notes?', answer: 'Use active recall, practice questions and spaced repetition.' }
    ]
  };
}

function localQuizFallback({ subject = 'Computer Science', topic = 'General', difficulty = 'Medium', questionCount = 4 }) {
  const bank = [
    {
      type: 'mcq',
      question: `Which statement best describes ${topic}?`,
      options: [
        `It is a core concept studied in ${subject}.`,
        'It only applies to unrelated subjects.',
        'It cannot be tested with questions.',
        'It has no practical applications.'
      ],
      correctIndex: 0,
      explanation: `${topic} is being treated as the target concept for this practice quiz.`
    },
    {
      type: 'true_false',
      question: 'Active recall is useful for long-term retention.',
      options: ['True', 'False'],
      correctIndex: 0,
      explanation: 'Active recall strengthens retrieval practice and helps reinforce memory.'
    },
    {
      type: 'mcq',
      question: 'Which study method is most appropriate for repeated exam revision?',
      options: ['Spaced repetition', 'Reading once', 'Skipping practice', 'Avoiding feedback'],
      correctIndex: 0,
      explanation: 'Spaced repetition distributes review sessions over time.'
    },
    {
      type: 'mcq',
      question: 'What should a student do after making a mistake in a practice quiz?',
      options: ['Review the explanation', 'Ignore it', 'Delete the quiz', 'Stop studying'],
      correctIndex: 0,
      explanation: 'Reviewing mistakes turns feedback into targeted revision.'
    },
    {
      type: 'mcq',
      question: 'Which item is most useful when creating a study plan?',
      options: ['Exam date and priority', 'Random timing', 'No deadlines', 'No topic list'],
      correctIndex: 0,
      explanation: 'Deadlines and priorities help allocate study time effectively.'
    }
  ];

  const questions = bank.slice(0, Math.max(1, Math.min(Number(questionCount) || 4, bank.length)))
    .map((q, i) => ({ ...q, id: `q_${Date.now()}_${i}` }));

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

export const aiService = {
  askChatbot: async (userMessage, history = [], persona = 'socratic', targetDocId = null) => {
    try {
      return await apiService.chat({
        userMessage,
        history,
        persona,
        targetDocId,
        materials: storageService.getMaterials()
      });
    } catch (error) {
      console.warn('Backend AI unavailable; using local fallback:', error.message);
      await sleep(350);
      return localChatFallback(userMessage, history, persona, targetDocId);
    }
  },

  summarizeNotes: async (documentText, documentTitle) => {
    try {
      return await apiService.summarize({ documentText, documentTitle });
    } catch (error) {
      console.warn('Backend summarizer unavailable; using local fallback:', error.message);
      await sleep(350);
      return localSummaryFallback(documentText, documentTitle);
    }
  },

  generateQuiz: async ({ subject, topic, difficulty, questionCount, docId = null }) => {
    const materials = storageService.getMaterials();
    const sourceDoc = docId ? materials.find(m => m.id === docId) : null;

    try {
      return await apiService.generateQuiz({
        subject,
        topic,
        difficulty,
        questionCount,
        documentText: sourceDoc?.extractedText || '',
        documentTitle: sourceDoc?.title || ''
      });
    } catch (error) {
      console.warn('Backend quiz generator unavailable; using local fallback:', error.message);
      await sleep(350);
      return localQuizFallback({ subject, topic, difficulty, questionCount });
    }
  },

  generateRecommendations: () => {
    const quizzes = storageService.getQuizzes();
    const planner = storageService.getPlannerEvents();
    const profile = storageService.getProfile();
    const recs = [];

    const upcomingExams = planner.filter(p => p.type === 'exam' && !p.completed);
    if (upcomingExams.length) {
      const nextExam = upcomingExams[0];
      recs.push({
        id: 'rec-exam',
        type: 'urgent',
        title: `Upcoming Exam: ${nextExam.title}`,
        desc: `Scheduled for ${nextExam.date}. Start a targeted practice quiz today.`,
        actionText: 'Start Quiz Now',
        tabTarget: 'quizzes',
        icon: '⚠️'
      });
    }

    const lowScores = quizzes.filter(q => Number(q.score || 0) < 70);
    if (lowScores.length) {
      recs.push({
        id: 'rec-weak',
        type: 'revision',
        title: `Weak Area Detected: ${lowScores[0].subject || 'General'}`,
        desc: 'Your recent performance is below 70%. Review notes and practice again.',
        actionText: 'Review Notes',
        tabTarget: 'summarizer',
        icon: '💡'
      });
    } else {
      recs.push({
        id: 'rec-boost',
        type: 'growth',
        title: 'Mastery Booster',
        desc: 'Your performance is stable. Try a harder quiz to challenge yourself.',
        actionText: 'Generate Hard Quiz',
        tabTarget: 'quizzes',
        icon: '🚀'
      });
    }

    recs.push({
      id: 'rec-pref',
      type: 'tip',
      title: 'Personalized Study Tip',
      desc: `Your learning preference is "${profile.studyPreference}". Use active recall and the AI Tutor together.`,
      actionText: 'Open AI Tutor',
      tabTarget: 'chatbot',
      icon: '🤖'
    });

    return recs;
  }
};

// Storage Service for AI Study Assistant
// Handles LocalStorage persistence for:
// Profile, Materials, Quizzes, Planner, Gamification,
// Settings, Analytics and Chat Logs.

const STORAGE_KEYS = {
  USER_PROFILE: 'ai_study_user_profile',
  MATERIALS: 'ai_study_materials',
  QUIZZES: 'ai_study_quizzes',
  PLANNER: 'ai_study_planner_events',
  GAMIFICATION: 'ai_study_gamification',
  SETTINGS: 'ai_study_settings',
  ANALYTICS: 'ai_study_analytics',
  CHAT_LOGS: 'ai_study_chat_logs'
};

// ============================================================
// DEFAULT PROFILE
// ============================================================

const DEFAULT_PROFILE = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex.student@edu.com',
  gradeLevel: 'College Senior / Undergrad',
  subjects: [
    'Computer Science',
    'Physics',
    'Biology',
    'Data Structures',
    'Organic Chemistry'
  ],
  studyPreference: 'Visual & Interactive Practice',
  dailyGoalMinutes: 45,
  avatar: '🎓'
};

// ============================================================
// DEFAULT GAMIFICATION
// ============================================================

const DEFAULT_GAMIFICATION = {
  streakDays: 4,
  lastStudyDate: new Date().toISOString().split('T')[0],
  totalXP: 1450,
  level: 4,

  badges: [
    {
      id: 'first_quiz',
      title: 'Quiz Rookie',
      icon: '🎯',
      desc: 'Completed your first AI practice quiz',
      unlocked: true,
      unlockedAt: '2026-08-10'
    },
    {
      id: 'streak_3',
      title: 'Consistency Champ',
      icon: '🔥',
      desc: 'Maintained a 3-day study streak',
      unlocked: true,
      unlockedAt: '2026-08-11'
    },
    {
      id: 'rag_master',
      title: 'Document Detective',
      icon: '🔍',
      desc: 'Asked 5 questions using document RAG',
      unlocked: true,
      unlockedAt: '2026-08-12'
    },
    {
      id: 'summarizer_pro',
      title: 'Digest Master',
      icon: '📝',
      desc: 'Summarized 3 study documents',
      unlocked: false
    },
    {
      id: 'perfect_quiz',
      title: 'Flawless Mind',
      icon: '⚡',
      desc: 'Scored 100% on a hard difficulty quiz',
      unlocked: false
    },
    {
      id: 'night_owl',
      title: 'Night Scholar',
      icon: '🦉',
      desc: 'Completed a study session after 10 PM',
      unlocked: true,
      unlockedAt: '2026-08-12'
    }
  ],

  dailyGoalCompleted: true
};

// ============================================================
// DEFAULT MATERIALS
// ============================================================

const DEFAULT_MATERIALS = [
  {
    id: 'doc-1',
    title: 'Data Structures & Algorithms Overview',
    subject: 'Computer Science',
    topic: 'Trees, Graphs & Dynamic Programming',
    fileName: 'dsa_overview.pdf',
    uploadedAt: '2026-08-10T10:30:00Z',
    fileSize: '1.2 MB',

    extractedText: `
Data Structures & Algorithms Overview.

Chapter 1: Binary Search Trees & AVL Trees.

A binary search tree is a node-based binary tree data structure
which has the following properties:

The left subtree of a node contains only nodes with keys lesser
than the node's key.

The right subtree of a node contains only nodes with keys
greater than the node's key.

AVL trees are self-balancing binary search trees where the
difference between heights of left and right subtrees cannot
be more than 1 for all nodes.

Chapter 2: Graph Algorithms & Dijkstra's Algorithm.

Graphs consist of vertices V and edges E.

Dijkstra's algorithm finds the shortest path from a single
source vertex to all other vertices in a weighted graph with
non-negative edge weights.

Time complexity using a Min-Heap priority queue is
O((V + E) log V).

Chapter 3: Dynamic Programming & Overlapping Subproblems.

Dynamic programming is an algorithmic technique used to solve
optimization problems by breaking them down into simpler
subproblems.

Key characteristics:
Optimal Substructure and Overlapping Subproblems.

Tabulation is bottom-up, while Memoization is top-down
recursion with caching.
`,

    summary:
      'Comprehensive notes covering Binary Search Trees, AVL balance factors, Dijkstra shortest path algorithm with time complexity O((V+E)log V), and Dynamic Programming fundamentals (Memoization vs Tabulation).',

    flashcards: [
      {
        question: 'What is the time complexity of Dijkstra with Min-Heap?',
        answer: 'O((V + E) log V)'
      },
      {
        question: 'What are the two core criteria for Dynamic Programming?',
        answer:
          'Optimal Substructure and Overlapping Subproblems'
      },
      {
        question: 'How do AVL trees maintain balance?',
        answer:
          'The height difference between left and right subtrees cannot exceed 1 for any node.'
      }
    ]
  },

  {
    id: 'doc-2',
    title: 'Quantum Mechanics & Wave Functions',
    subject: 'Physics',
    topic: 'Schrödinger Equation & Wave Mechanics',
    fileName: 'quantum_physics.pdf',
    uploadedAt: '2026-08-11T14:20:00Z',
    fileSize: '850 KB',

    extractedText: `
Quantum Mechanics Lecture Notes.

Section 1: The Wave Function & Born Rule.

In quantum physics, a wave function Psi(x,t) describes the
quantum state of an isolated system.

The Born rule states that the probability density of finding
a particle at position x is proportional to |Psi(x,t)|^2.

Section 2: The Time-Dependent Schrödinger Equation.

i * hbar * d/dt Psi = H * Psi

where H is the Hamiltonian operator representing total energy
(Kinetic + Potential).

Section 3: Heisenberg Uncertainty Principle.

Delta x * Delta p >= hbar / 2.

It is fundamentally impossible to simultaneously determine
both the exact position and exact momentum of a quantum particle.
`,

    summary:
      'Key concepts in quantum mechanics including Born rule probability density, the time-dependent Schrödinger equation, and Heisenberg Uncertainty Principle limits.',

    flashcards: [
      {
        question: 'What does the Born rule define?',
        answer:
          'The probability density of finding a particle at a given position is |Psi(x,t)|^2.'
      },
      {
        question: 'State Heisenberg Uncertainty Principle inequality',
        answer: 'Delta x * Delta p >= hbar / 2'
      }
    ]
  }
];

// ============================================================
// DEFAULT PLANNER
// ============================================================

const DEFAULT_PLANNER = [
  {
    id: 'plan-1',
    title: 'Data Structures Midterm Exam',
    subject: 'Computer Science',
    date: '2026-08-20',
    type: 'exam',
    priority: 'High',
    completed: false,
    notes: 'Focus on Graph algorithms and DP memoization'
  },
  {
    id: 'plan-2',
    title: 'Review Quantum Mechanics Chapter 2',
    subject: 'Physics',
    date: '2026-08-14',
    type: 'revision',
    priority: 'Medium',
    completed: true,
    notes: 'Practice Schrödinger equation derivations'
  },
  {
    id: 'plan-3',
    title: 'Organic Chemistry Lab Report',
    subject: 'Organic Chemistry',
    date: '2026-08-17',
    type: 'assignment',
    priority: 'High',
    completed: false,
    notes: 'Write up NMR spectrum analysis'
  }
];

// ============================================================
// DEFAULT QUIZZES
// ============================================================

const DEFAULT_QUIZZES = [
  {
    id: 'quiz-1',
    title: 'DSA & Graph Algorithms Practice Quiz',
    subject: 'Computer Science',
    score: 85,
    totalQuestions: 5,
    date: '2026-08-11T16:00:00Z',

    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question:
          'What is the worst-case search time in an unbalanced Binary Search Tree?',
        options: [
          'O(1)',
          'O(log N)',
          'O(N)',
          'O(N^2)'
        ],
        correctIndex: 2,
        explanation:
          'In an unbalanced BST (e.g. skewed tree), search degrades to O(N).'
      },

      {
        id: 'q2',
        type: 'true_false',
        question:
          'Dijkstra algorithm works correctly on graphs with negative edge weights.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation:
          'Dijkstra assumes non-negative edge weights. Bellman-Ford must be used for negative edge weights.'
      }
    ]
  }
];

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const DEFAULT_SETTINGS = {
  apiKey: '',
  model: 'local_ai',
  theme: 'light',
  notifications: true
};

// ============================================================
// DEFAULT ANALYTICS
// ============================================================

const DEFAULT_ANALYTICS = {
  totalStudyMinutes: 320,
  weeklyStudyMinutes: [35, 50, 40, 60, 45, 30, 60],

  subjectProgress: [
    {
      subject: 'Computer Science',
      progress: 82
    },
    {
      subject: 'Physics',
      progress: 68
    },
    {
      subject: 'Biology',
      progress: 54
    },
    {
      subject: 'Data Structures',
      progress: 76
    }
  ],

  quizAccuracy: 85,
  completedSessions: 12
};

// ============================================================
// DEFAULT CHAT LOGS
// ============================================================

const DEFAULT_CHAT_LOGS = [];

// ============================================================
// SAFE STORAGE HELPERS
// ============================================================

const isStorageAvailable = () => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch (error) {
    return false;
  }
};

const readStorage = (key, fallback) => {
  if (!isStorageAvailable()) {
    return fallback;
  }

  try {
    const data = localStorage.getItem(key);

    if (!data) {
      return fallback;
    }

    return JSON.parse(data);
  } catch (error) {
    console.warn(
      `Could not read localStorage key: ${key}`,
      error
    );

    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(
      `Could not save localStorage key: ${key}`,
      error
    );

    return false;
  }
};

// ============================================================
// STORAGE SERVICE
// ============================================================

export const storageService = {
  // ----------------------------------------------------------
  // PROFILE
  // ----------------------------------------------------------

  getProfile: () => {
    return readStorage(
      STORAGE_KEYS.USER_PROFILE,
      DEFAULT_PROFILE
    );
  },

  saveProfile: (profile) => {
    return writeStorage(
      STORAGE_KEYS.USER_PROFILE,
      profile
    );
  },

  // ----------------------------------------------------------
  // MATERIALS
  // ----------------------------------------------------------

  getMaterials: () => {
    return readStorage(
      STORAGE_KEYS.MATERIALS,
      DEFAULT_MATERIALS
    );
  },

  saveMaterials: (materials) => {
    return writeStorage(
      STORAGE_KEYS.MATERIALS,
      materials
    );
  },

  addMaterial: (material) => {
    const list = storageService.getMaterials();

    const newMaterial = {
      ...material,
      id:
        material?.id ||
        `doc-${Date.now()}`,
      uploadedAt:
        material?.uploadedAt ||
        new Date().toISOString()
    };

    list.unshift(newMaterial);

    storageService.saveMaterials(list);

    return list;
  },

  deleteMaterial: (id) => {
    const list = storageService
      .getMaterials()
      .filter((material) => material.id !== id);

    storageService.saveMaterials(list);

    return list;
  },

  updateMaterial: (id, updates) => {
    const list = storageService.getMaterials();

    const updatedList = list.map((material) =>
      material.id === id
        ? {
            ...material,
            ...updates
          }
        : material
    );

    storageService.saveMaterials(updatedList);

    return updatedList;
  },

  getMaterialById: (id) => {
    const list = storageService.getMaterials();

    return (
      list.find((material) => material.id === id) ||
      null
    );
  },

  // ----------------------------------------------------------
  // QUIZZES
  // ----------------------------------------------------------

  getQuizzes: () => {
    return readStorage(
      STORAGE_KEYS.QUIZZES,
      DEFAULT_QUIZZES
    );
  },

  saveQuizzes: (quizzes) => {
    return writeStorage(
      STORAGE_KEYS.QUIZZES,
      quizzes
    );
  },

  saveQuizResult: (quizResult) => {
    const list = storageService.getQuizzes();

    const result = {
      ...quizResult,
      id:
        quizResult?.id ||
        `quiz-${Date.now()}`,
      date:
        quizResult?.date ||
        new Date().toISOString()
    };

    list.unshift(result);

    storageService.saveQuizzes(list);

    return list;
  },

  deleteQuiz: (id) => {
    const list = storageService
      .getQuizzes()
      .filter((quiz) => quiz.id !== id);

    storageService.saveQuizzes(list);

    return list;
  },

  // ----------------------------------------------------------
  // PLANNER
  // ----------------------------------------------------------

  getPlannerEvents: () => {
    return readStorage(
      STORAGE_KEYS.PLANNER,
      DEFAULT_PLANNER
    );
  },

  savePlannerEvents: (events) => {
    return writeStorage(
      STORAGE_KEYS.PLANNER,
      events
    );
  },

  addPlannerEvent: (event) => {
    const events = storageService.getPlannerEvents();

    const newEvent = {
      ...event,
      id:
        event?.id ||
        `plan-${Date.now()}`
    };

    events.push(newEvent);

    storageService.savePlannerEvents(events);

    return events;
  },

  updatePlannerEvent: (id, updates) => {
    const events = storageService.getPlannerEvents();

    const updatedEvents = events.map((event) =>
      event.id === id
        ? {
            ...event,
            ...updates
          }
        : event
    );

    storageService.savePlannerEvents(updatedEvents);

    return updatedEvents;
  },

  deletePlannerEvent: (id) => {
    const events = storageService
      .getPlannerEvents()
      .filter((event) => event.id !== id);

    storageService.savePlannerEvents(events);

    return events;
  },

  // ----------------------------------------------------------
  // GAMIFICATION
  // ----------------------------------------------------------

  getGamification: () => {
    return readStorage(
      STORAGE_KEYS.GAMIFICATION,
      DEFAULT_GAMIFICATION
    );
  },

  saveGamification: (data) => {
    return writeStorage(
      STORAGE_KEYS.GAMIFICATION,
      data
    );
  },

  addXP: (amount = 0) => {
    const gamification =
      storageService.getGamification();

    const safeAmount = Number(amount) || 0;

    const totalXP =
      Math.max(0, gamification.totalXP + safeAmount);

    const level =
      Math.floor(totalXP / 500) + 1;

    const updated = {
      ...gamification,
      totalXP,
      level
    };

    storageService.saveGamification(updated);

    return updated;
  },

  updateStreak: () => {
    const gamification =
      storageService.getGamification();

    const today =
      new Date().toISOString().split('T')[0];

    if (gamification.lastStudyDate === today) {
      return gamification;
    }

    const updated = {
      ...gamification,
      streakDays: Math.max(
        1,
        (gamification.streakDays || 0) + 1
      ),
      lastStudyDate: today
    };

    storageService.saveGamification(updated);

    return updated;
  },

  unlockBadge: (badgeId) => {
    const gamification =
      storageService.getGamification();

    const updatedBadges =
      gamification.badges.map((badge) => {
        if (
          badge.id === badgeId &&
          !badge.unlocked
        ) {
          return {
            ...badge,
            unlocked: true,
            unlockedAt:
              new Date()
                .toISOString()
                .split('T')[0]
          };
        }

        return badge;
      });

    const updated = {
      ...gamification,
      badges: updatedBadges
    };

    storageService.saveGamification(updated);

    return updated;
  },

  // ----------------------------------------------------------
  // SETTINGS
  // ----------------------------------------------------------

  getSettings: () => {
    return readStorage(
      STORAGE_KEYS.SETTINGS,
      DEFAULT_SETTINGS
    );
  },

  saveSettings: (settings) => {
    return writeStorage(
      STORAGE_KEYS.SETTINGS,
      {
        ...DEFAULT_SETTINGS,
        ...settings
      }
    );
  },

  // ----------------------------------------------------------
  // ANALYTICS
  // ----------------------------------------------------------

  getAnalytics: () => {
    return readStorage(
      STORAGE_KEYS.ANALYTICS,
      DEFAULT_ANALYTICS
    );
  },

  saveAnalytics: (analytics) => {
    return writeStorage(
      STORAGE_KEYS.ANALYTICS,
      analytics
    );
  },

  updateAnalytics: (updates) => {
    const current =
      storageService.getAnalytics();

    const updated = {
      ...current,
      ...updates
    };

    storageService.saveAnalytics(updated);

    return updated;
  },

  // ----------------------------------------------------------
  // CHAT LOGS
  // ----------------------------------------------------------

  getChatLogs: () => {
    return readStorage(
      STORAGE_KEYS.CHAT_LOGS,
      DEFAULT_CHAT_LOGS
    );
  },

  saveChatLogs: (logs) => {
    return writeStorage(
      STORAGE_KEYS.CHAT_LOGS,
      logs
    );
  },

  addChatLog: (message) => {
    const logs =
      storageService.getChatLogs();

    const newMessage = {
      ...message,
      id:
        message?.id ||
        `chat-${Date.now()}`,
      timestamp:
        message?.timestamp ||
        new Date().toISOString()
    };

    logs.push(newMessage);

    storageService.saveChatLogs(logs);

    return logs;
  },

  clearChatLogs: () => {
    storageService.saveChatLogs([]);

    return [];
  },

  // ----------------------------------------------------------
  // RESET
  // ----------------------------------------------------------

  resetAllData: () => {
    if (!isStorageAvailable()) {
      return false;
    }

    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      console.warn(
        'Could not reset local storage',
        error
      );

      return false;
    }
  }
};

export default storageService;
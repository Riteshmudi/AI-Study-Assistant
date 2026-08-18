import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  BookOpen,
  Bot,
  FileText,
  HelpCircle,
  Calendar,
  BarChart3,
  Trophy,
  Brain,
  UploadCloud,
  Target,
  MessageCircle
} from 'lucide-react';

import { storageService } from '../services/storageService';

const steps = [
  {
    title: 'Upload your notes',
    text: 'PDFs, docs & handwritten notes',
    color: '#3b82f6',
    icon: UploadCloud
  },
  {
    title: 'AI analyzes content',
    text: 'Key concepts are extracted',
    color: '#8b5cf6',
    icon: Brain
  },
  {
    title: 'Build your study set',
    text: 'Summaries, quizzes & cards',
    color: '#f59e0b',
    icon: Target
  },
  {
    title: 'Ready to Study!',
    text: 'SM-2 spaced repetition schedule created',
    color: '#10b981',
    icon: Check
  }
];

export default function Dashboard({ onNavigateTab }) {
  const [activeStep, setActiveStep] = useState(3);

  const materials = storageService.getMaterials();
  const quizzes = storageService.getQuizzes();
  const planner = storageService.getPlannerEvents();
  const gamification = storageService.getGamification();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  const avgScore = quizzes.length
    ? Math.round(
        quizzes.reduce(
          (sum, quiz) => sum + Number(quiz.score || 0),
          0
        ) / quizzes.length
      )
    : 85;

  const upcomingExams = planner.filter(
    (item) => item.type === 'exam' && !item.completed
  );

  const step = steps[activeStep];
  const StepIcon = step.icon;

  const navigate = (tab) => {
    if (typeof onNavigateTab === 'function') {
      onNavigateTab(tab);
    }
  };

  return (
    <div className="landing-page animate-fade-in">

      {/* =========================
          HERO SECTION
      ========================= */}
      <section className="hero-section">

        <div className="hero-copy">

          <div className="hero-pill">
            <Sparkles size={15} />
            <span>AI-Powered Study Platform</span>
            <i />
          </div>

          <h1>
            Drop Notes,
            <br />
            <span>Ace Any Exam.</span>
          </h1>

          <p className="hero-description">
            Upload PDFs, docs, or handwritten notes — AI generates{' '}
            <strong>
              flashcards, quizzes & concept maps
            </strong>{' '}
            in seconds. Review with spaced repetition, solve problems
            step-by-step, and level up with XP.
          </p>

          <div className="hero-cta-row">

            <button
              className="hero-primary"
              onClick={() => navigate('materials')}
            >
              Start Learning Free
              <ArrowRight size={18} />
            </button>

            <button
              className="hero-secondary"
              onClick={() => navigate('chatbot')}
            >
              <Play size={16} fill="currentColor" />
              See How It Works
            </button>

          </div>
        </div>

        {/* =========================
            PREVIEW
        ========================= */}
        <div className="preview-area">

          <div className="preview-glow" />

          <div className="study-preview">

            {/* TITLE BAR */}
            <div className="preview-titlebar">

              <div className="window-dots">
                <i />
                <i />
                <i />
              </div>

              <div className="preview-brand">
                <span>
                  <Sparkles size={13} />
                </span>
                Studyield
              </div>

              <div className="ready-status">
                <b />
                READY
              </div>

            </div>

            {/* STEP PROGRESS */}
            <div className="step-progress">

              {steps.map((item, index) => (
                <React.Fragment key={item.title}>

                  <button
                    type="button"
                    className={`step-dot ${
                      index <= activeStep ? 'done' : ''
                    } ${
                      index === activeStep ? 'current' : ''
                    }`}
                    style={{
                      '--step-color': item.color
                    }}
                    onClick={() => setActiveStep(index)}
                    aria-label={`Step ${index + 1}`}
                  >
                    {index < activeStep ? (
                      <Check size={14} />
                    ) : (
                      index + 1
                    )}
                  </button>

                  {index < steps.length - 1 && (
                    <span
                      className={`step-line ${
                        index < activeStep ? 'filled' : ''
                      }`}
                    />
                  )}

                </React.Fragment>
              ))}

            </div>

            {/* PREVIEW CONTENT */}
            <div
              className="preview-content"
              key={activeStep}
            >

              <div
                className="preview-icon-ring"
                style={{
                  '--step-color': step.color
                }}
              >
                <StepIcon size={34} />
              </div>

              <h3>{step.title}</h3>

              <p>{step.text}</p>

              <div className="preview-chips">

                <button
                  type="button"
                  onClick={() => navigate('summarizer')}
                >
                  <BookOpen size={13} />
                  Flashcards
                </button>

                <button
                  type="button"
                  onClick={() => navigate('quizzes')}
                >
                  <Target size={13} />
                  Quizzes
                </button>

                <button
                  type="button"
                  onClick={() => navigate('chatbot')}
                >
                  <MessageCircle size={13} />
                  AI Tutor
                </button>

              </div>

            </div>

            {/* FOOTER */}
            <div className="preview-footer">

              <span>
                Step {activeStep + 1} —{' '}
                {activeStep === 3
                  ? 'All materials ready!'
                  : 'AI is working...'}
              </span>

              <span>
                <b />
                AI Active
              </span>

            </div>

          </div>
        </div>
      </section>

      {/* =========================
          STATS
      ========================= */}
      <section className="stats-grid">

        <button
          type="button"
          className="stat-card"
          onClick={() => navigate('materials')}
        >
          <span className="stat-icon green">
            <BookOpen size={23} />
          </span>

          <span>
            <small>Study Materials</small>
            <strong>
              {materials.length} Documents
            </strong>
          </span>
        </button>

        <button
          type="button"
          className="stat-card"
          onClick={() => navigate('analytics')}
        >
          <span className="stat-icon blue">
            <BarChart3 size={23} />
          </span>

          <span>
            <small>Avg Quiz Score</small>
            <strong>{avgScore}%</strong>
          </span>
        </button>

        <button
          type="button"
          className="stat-card"
          onClick={() => navigate('gamification')}
        >
          <span className="stat-icon amber">
            <Trophy size={23} />
          </span>

          <span>
            <small>Scholar XP Level</small>
            <strong>
              Level {gamification.level}
            </strong>
          </span>
        </button>

        <button
          type="button"
          className="stat-card"
          onClick={() => navigate('planner')}
        >
          <span className="stat-icon purple">
            <Calendar size={23} />
          </span>

          <span>
            <small>Upcoming Exams</small>
            <strong>
              {upcomingExams.length} Exams
            </strong>
          </span>
        </button>

      </section>

      {/* =========================
          FEATURES / AI TOOLS
      ========================= */}
      <section className="tool-hub saas-card">

        <h2>
          <Sparkles size={20} />
          Features & AI Study Tools Workspace
        </h2>

        <div className="tool-grid">

          <ToolCard
            icon={<BookOpen />}
            title="Upload Notes & PDFs"
            text="Organize by subject & extract text"
            onClick={() => navigate('materials')}
          />

          <ToolCard
            icon={<Bot />}
            title="AI Study Tutor"
            text="Socratic Q&A with document citations"
            onClick={() => navigate('chatbot')}
          />

          <ToolCard
            icon={<FileText />}
            title="Summarizer & Cards"
            text="Key takeaways & 3D flashcards"
            onClick={() => navigate('summarizer')}
          />

          <ToolCard
            icon={<HelpCircle />}
            title="Quiz Generator"
            text="Auto-graded practice exams"
            onClick={() => navigate('quizzes')}
          />

        </div>

      </section>

    </div>
  );
}

/* =========================
   TOOL CARD COMPONENT
========================= */

function ToolCard({
  icon,
  title,
  text,
  onClick
}) {
  return (
    <button
      type="button"
      className="tool-card"
      onClick={onClick}
    >
      <span>{icon}</span>

      <strong>{title}</strong>

      <small>{text}</small>
    </button>
  );
}
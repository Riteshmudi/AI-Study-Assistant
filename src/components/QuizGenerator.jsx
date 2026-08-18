import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, Clock, CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { gamificationService } from '../services/gamificationService';

export default function QuizGenerator() {
  const materials = storageService.getMaterials();
  const profile = storageService.getProfile();

  // Generator form
  const [subject, setSubject] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(4);
  const [selectedDocId, setSelectedDocId] = useState('all');
  const [loading, setLoading] = useState(false);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Timer effect during quiz
  useEffect(() => {
    let interval = null;
    if (activeQuiz && !quizFinished) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeQuiz, quizFinished]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const quiz = await aiService.generateQuiz({
        subject,
        topic: selectedDocId === 'all' ? 'General' : materials.find(m => m.id === selectedDocId)?.title,
        difficulty,
        questionCount,
        docId: selectedDocId === 'all' ? null : selectedDocId
      });

      setActiveQuiz(quiz);
      setCurrentQIdx(0);
      setSelectedAnswers({});
      setQuizFinished(false);
      setTimerSeconds(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    if (quizFinished) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    
    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / activeQuiz.questions.length) * 100);
    setFinalScore(scorePercentage);
    setQuizFinished(true);

    const resultObj = {
      id: activeQuiz.id,
      title: activeQuiz.title,
      subject: activeQuiz.subject,
      score: scorePercentage,
      totalQuestions: activeQuiz.questions.length,
      correctAnswers: correctCount,
      difficulty: activeQuiz.difficulty,
      durationSeconds: timerSeconds,
      date: new Date().toISOString()
    };
    storageService.saveQuizResult(resultObj);

    gamificationService.addXP(100, 'Completed AI Quiz');
    gamificationService.unlockBadge('first_quiz');

    if (scorePercentage === 100 && difficulty === 'Hard') {
      gamificationService.unlockBadge('perfect_quiz');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {activeQuiz ? (
        <div className="saas-card" style={{ padding: '30px' }}>
          {!quizFinished ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div>
                  <span className="badge badge-indigo">{activeQuiz.subject}</span>
                  <h2 style={{ fontSize: '1.3rem', marginTop: '4px' }}>{activeQuiz.title}</h2>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-warning)', fontWeight: 600 }}>
                    <Clock size={18} /> {formatTime(timerSeconds)}
                  </div>
                  <span className="badge badge-emerald">Question {currentQIdx + 1} / {activeQuiz.questions.length}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((currentQIdx + 1) / activeQuiz.questions.length) * 100}%`, background: 'var(--gradient-brand)', transition: 'width 0.3s ease' }} />
              </div>

              {/* Question Text */}
              {activeQuiz.questions[currentQIdx] && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: 1.5, marginBottom: '20px' }}>
                    {activeQuiz.questions[currentQIdx].question}
                  </h3>

                  {/* Options List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {activeQuiz.questions[currentQIdx].options.map((opt, idx) => {
                      const isSelected = selectedAnswers[activeQuiz.questions[currentQIdx].id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(activeQuiz.questions[currentQIdx].id, idx)}
                          style={{
                            padding: '16px 20px',
                            borderRadius: 'var(--radius-md)',
                            background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                            border: isSelected ? '2px solid var(--primary-indigo)' : '1px solid var(--border-subtle)',
                            color: 'white',
                            textAlign: 'left',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: isSelected ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quiz Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button
                  disabled={currentQIdx === 0}
                  onClick={() => setCurrentQIdx(prev => prev - 1)}
                  className="btn-secondary"
                >
                  Previous Question
                </button>

                {currentQIdx < activeQuiz.questions.length - 1 ? (
                  <button onClick={() => setCurrentQIdx(prev => prev + 1)} className="btn-primary">
                    Next Question <ArrowRight size={18} />
                  </button>
                ) : (
                  <button onClick={handleSubmitQuiz} className="btn-primary" style={{ background: 'var(--gradient-emerald)' }}>
                    <CheckCircle size={18} /> Submit Quiz & Auto-Grade
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Score Summary View */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: finalScore >= 80 ? 'var(--gradient-emerald)' : 'var(--gradient-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '2rem'
              }}>
                {finalScore >= 80 ? '🏆' : '📊'}
              </div>

              <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                Quiz Completed! Score: {finalScore}%
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Time taken: {formatTime(timerSeconds)} | +100 XP Earned!
              </p>

              {/* Explanations List */}
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                {activeQuiz.questions.map((q, idx) => {
                  const userAns = selectedAnswers[q.id];
                  const isCorrect = userAns === q.correctIndex;
                  return (
                    <div key={q.id} className="saas-card" style={{ padding: '16px', borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700 }}>Q{idx + 1}: {q.question}</span>
                        <span>{isCorrect ? <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={16} /> Correct</span> : <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={16} /> Incorrect</span>}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button onClick={() => setActiveQuiz(null)} className="btn-primary">
                  <RotateCcw size={18} /> Take Another Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Generator Config Panel */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          <div className="saas-card" style={{ padding: '28px' }}>
            <h1 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <HelpCircle color="var(--primary-purple)" size={28} /> AI Question & Quiz Generator
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Instantly generate auto-graded multiple choice, true/false, and short answer practice exams from your notes.
            </p>

            <form onSubmit={handleGenerateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Target Subject</label>
                <select className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {profile.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Source Notes Document</label>
                <select className="input-field" value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)}>
                  <option value="all">🌐 All Subject Notes</option>
                  {materials.map(m => <option key={m.id} value={m.id}>📄 {m.title}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Difficulty</label>
                  <select className="input-field" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="Easy">Easy (Fundamentals)</option>
                    <option value="Medium">Medium (Balanced Exam Level)</option>
                    <option value="Hard">Hard (Advanced Problem Solving)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Number of Questions</label>
                  <input type="number" className="input-field" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} min={2} max={10} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', justifyContent: 'center', fontSize: '1rem' }}>
                <Sparkles size={20} /> {loading ? 'Generating Quiz...' : 'Generate Practice Quiz & Start'}
              </button>
            </form>
          </div>

          <div className="saas-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} color="var(--status-warning)" /> Quiz Master Rewards
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span className="badge badge-emerald" style={{ marginBottom: '4px' }}>+100 XP</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Awarded for completing any practice quiz.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <span className="badge badge-indigo" style={{ marginBottom: '4px' }}>Badge Unlock</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Score 100% on Hard difficulty to unlock "Flawless Mind".</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

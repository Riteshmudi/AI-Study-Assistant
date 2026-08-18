import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  RefreshCw,
  FileText
} from 'lucide-react';

import { storageService } from '../services/storageService';
import { gamificationService } from '../services/gamificationService';

const BACKEND_URL = 'http://localhost:5000';

export default function AIChatbot({ selectedDocContext }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your AI Study Tutor. Ask me any question, choose a learning persona below, or select an uploaded document for targeted answers.',
      persona: 'socratic',
      citations: [],
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('socratic');
  const [targetDocId, setTargetDocId] = useState(
    selectedDocContext?.id || 'all'
  );
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  const materials = storageService.getMaterials();

  useEffect(() => {
    if (selectedDocContext?.id) {
      setTargetDocId(selectedDocContext.id);
    }
  }, [selectedDocContext]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, loading]);

  const getSelectedDocument = () => {
    if (targetDocId === 'all') {
      return null;
    }

    return materials.find(
      (material) => material.id === targetDocId
    ) || null;
  };

  const handleSend = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const userText = inputMessage.trim();

    if (!userText || loading) {
      return;
    }

    setInputMessage('');

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    setLoading(true);

    try {
      const selectedDocument = getSelectedDocument();

      const response = await fetch(
        `${BACKEND_URL}/api/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: userText,

            document: selectedDocument
              ? {
                  id: selectedDocument.id,
                  title: selectedDocument.title,
                  subject: selectedDocument.subject,
                  fileName: selectedDocument.fileName,
                  extractedText: selectedDocument.extractedText
                }
              : null,

            persona: selectedPersona,

            history: messages.map((message) => ({
              sender: message.sender,
              text: message.text
            }))
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Backend request failed'
        );
      }

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'I could not generate a response.',
        persona: selectedPersona,
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages((prev) => [
        ...prev,
        aiMessage
      ]);

      try {
        gamificationService.addXP(
          15,
          'Asked AI Study Tutor'
        );
      } catch (xpError) {
        console.warn(
          'XP update failed:',
          xpError
        );
      }

    } catch (error) {
      console.error(
        'AI Chat Error:',
        error
      );

      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text:
          '⚠️ I could not connect to the backend. Please make sure the backend server is running at http://localhost:5000.',
        persona: selectedPersona,
        citations: [],
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages((prev) => [
        ...prev,
        errorMessage
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starterPrompts = [
    'Explain Dijkstra algorithm step-by-step with min-heap complexity.',
    'What is the Born rule and Schrödinger wave function?',
    'Summarize the key difference between memoization and tabulation.',
    'How do self-balancing AVL trees maintain O(log N) operations?'
  ];

  const personas = [
    {
      id: 'socratic',
      name: 'Socratic Tutor',
      icon: '🦉'
    },
    {
      id: 'eli5',
      name: 'ELI5 Explainer',
      icon: '👶'
    },
    {
      id: 'examiner',
      name: 'Strict Examiner',
      icon: '⚖️'
    }
  ];

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: 'calc(100vh - 140px)'
      }}
    >

      {/* TOP OPTIONS */}
      <div
        className="saas-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >

        {/* PERSONA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}
          >
            Tutor Persona:
          </span>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap'
            }}
          >
            {personas.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() =>
                  setSelectedPersona(persona.id)
                }
                className={
                  selectedPersona === persona.id
                    ? 'btn-primary'
                    : 'btn-secondary'
                }
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem'
                }}
              >
                <span>{persona.icon}</span>{' '}
                {persona.name}
              </button>
            ))}
          </div>
        </div>

        {/* DOCUMENT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <BookOpen
            size={16}
            color="var(--primary-indigo)"
          />

          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}
          >
            Document:
          </span>

          <select
            className="input-field"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              width: 'auto',
              maxWidth: '320px'
            }}
            value={targetDocId}
            onChange={(e) =>
              setTargetDocId(e.target.value)
            }
          >
            <option value="all">
              🌐 All Uploaded Notes
            </option>

            {materials.map((material) => (
              <option
                key={material.id}
                value={material.id}
              >
                📄 {material.title} ({material.subject})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CHAT */}
      <div
        className="saas-card"
        style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >

        {/* MESSAGE AREA */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingRight: '8px'
          }}
        >

          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf:
                  msg.sender === 'user'
                    ? 'flex-end'
                    : 'flex-start',
                maxWidth: '85%'
              }}
            >

              {/* AI ICON */}
              {msg.sender === 'ai' && (
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bot
                    size={20}
                    color="white"
                  />
                </div>
              )}

              {/* MESSAGE */}
              <div
                style={{
                  background:
                    msg.sender === 'user'
                      ? 'var(--gradient-brand)'
                      : 'rgba(15, 23, 42, 0.85)',

                  border:
                    msg.sender === 'user'
                      ? 'none'
                      : '1px solid var(--border-subtle)',

                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 18px',
                  color: 'white',

                  boxShadow:
                    msg.sender === 'user'
                      ? '0 4px 14px rgba(99, 102, 241, 0.3)'
                      : 'none'
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '20px',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '6px'
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700
                    }}
                  >
                    {msg.sender === 'user'
                      ? 'You'
                      : `AI Tutor (${msg.persona || selectedPersona})`}
                  </span>

                  <span>
                    {msg.timestamp}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.94rem',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6
                  }}
                >
                  {msg.text}
                </div>

                {/* CITATIONS */}
                {msg.citations &&
                  msg.citations.length > 0 && (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop:
                          '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: '#a5b4fc',
                          fontWeight: 700,
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FileText size={12} />
                        Cited Sources
                      </p>

                      {msg.citations.map(
                        (citation, index) => (
                          <div
                            key={index}
                            style={{
                              fontSize: '0.75rem',
                              background:
                                'rgba(99, 102, 241, 0.1)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              marginBottom: '4px',
                              border:
                                '1px solid rgba(99, 102, 241, 0.2)'
                            }}
                          >
                            <strong>
                              {citation.docTitle ||
                                citation.title ||
                                'Document'}
                            </strong>

                            {citation.score !==
                              undefined && (
                              <>
                                {' '}
                                (Match:{' '}
                                {citation.score}%)
                              </>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>

              {/* USER ICON */}
              {msg.sender === 'user' && (
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <User
                    size={20}
                    color="white"
                  />
                </div>
              )}
            </div>
          ))}

          {/* LOADING */}
          {loading && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: 'flex-start'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot
                  size={20}
                  color="white"
                />
              </div>

              <div
                className="saas-card"
                style={{
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation:
                      'spin 1s linear infinite'
                  }}
                />

                <span
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  Connecting to backend...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* STARTER PROMPTS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '10px 0'
          }}
        >
          {starterPrompts.map((prompt, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                setInputMessage(prompt)
              }
              className="btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                whiteSpace: 'nowrap'
              }}
            >
              <Sparkles
                size={12}
                color="var(--status-warning)"
              />{' '}
              {prompt}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <form
          onSubmit={handleSend}
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '8px'
          }}
        >
          <input
            type="text"
            className="input-field"
            placeholder="Ask anything about your notes, formulas, or concepts..."
            value={inputMessage}
            onChange={(e) =>
              setInputMessage(e.target.value)
            }
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading ||
              !inputMessage.trim()
            }
            className="btn-primary"
            style={{
              padding: '12px 24px'
            }}
          >
            <Send size={18} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import LoginPage from './components/LoginPage';

import Dashboard from './components/Dashboard';
import MaterialsHub from './components/MaterialsHub';
import AIChatbot from './components/AIChatbot';
import NotesSummarizer from './components/NotesSummarizer';
import QuizGenerator from './components/QuizGenerator';
import StudyPlanner from './components/StudyPlanner';
import PerformanceTracker from './components/PerformanceTracker';
import AIRecommendations from './components/AIRecommendations';
import DocumentRAGWorkspace from './components/DocumentRAGWorkspace';
import GamificationHub from './components/GamificationHub';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [selectedDocContext, setSelectedDocContext] = useState(null);

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSectionNavigation = (section) => {
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      setIsSidebarOpen(false);

      setTimeout(() => {
        const element = document.getElementById(section);

        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);

      return;
    }

    const element = document.getElementById(section);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSelectDocForChat = (doc) => {
    setSelectedDocContext(doc);
    navigateTo('chatbot');
  };

  const handleSelectDocForSummary = (doc) => {
    setSelectedDocContext(doc);
    navigateTo('summarizer');
  };

  const handleSelectDocForQuiz = (doc) => {
    setSelectedDocContext(doc);
    navigateTo('quizzes');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const isDashboard = activeTab === 'dashboard';

  return (
    <div className="app-shell">

      <Navbar
        isLanding={isDashboard}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        onNavigateDashboard={() => navigateTo('dashboard')}
        onNavigateSection={handleSectionNavigation}
        onToggleSidebar={() => {
          setIsSidebarOpen((prev) => !prev);
        }}
      />

      {!isDashboard && (
        <div
          className={`sidebar-backdrop ${
            isSidebarOpen ? 'open' : ''
          }`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={
          isDashboard
            ? 'app-container dashboard-container'
            : 'app-container'
        }
      >

        {!isDashboard && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={navigateTo}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        <main
          className={
            isDashboard
              ? 'main-content landing-content'
              : 'main-content'
          }
        >

          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={navigateTo}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsHub
              onSelectDocForChat={handleSelectDocForChat}
              onSelectDocForSummary={handleSelectDocForSummary}
              onSelectDocForQuiz={handleSelectDocForQuiz}
            />
          )}

          {activeTab === 'chatbot' && (
            <AIChatbot
              selectedDocContext={selectedDocContext}
            />
          )}

          {activeTab === 'summarizer' && (
            <NotesSummarizer
              initialDoc={selectedDocContext}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizGenerator
              initialDoc={selectedDocContext}
            />
          )}

          {activeTab === 'planner' && (
            <StudyPlanner />
          )}

          {activeTab === 'analytics' && (
            <PerformanceTracker />
          )}

          {activeTab === 'recommendations' && (
            <AIRecommendations
              onNavigateTab={navigateTo}
            />
          )}

          {activeTab === 'rag_qa' && (
            <DocumentRAGWorkspace
              onOpenChatWithDoc={(docId) => {
                setSelectedDocContext({
                  id: docId
                });

                navigateTo('chatbot');
              }}
            />
          )}

          {activeTab === 'gamification' && (
            <GamificationHub />
          )}

          {activeTab === 'profile' && (
            <div className="page-section animate-fade-in">

              <div className="saas-card page-header">
                <h1>
                  Student Profile & Preferences
                </h1>

                <p>
                  Manage academic grade level, enrolled
                  subjects, daily study goals, and learning
                  style preferences.
                </p>
              </div>

              <div className="saas-card profile-action-card">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="btn-primary"
                  type="button"
                >
                  Edit Profile Configuration
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}


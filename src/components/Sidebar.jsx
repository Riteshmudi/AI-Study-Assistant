import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  FileText,
  Brain,
  CalendarDays,
  BarChart3,
  Sparkles,
  Database,
  Trophy,
  User,
  X
} from 'lucide-react';

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'materials',
    label: 'Study Materials',
    icon: BookOpen
  },
  {
    id: 'chatbot',
    label: 'AI Study Chat',
    icon: MessageSquare
  },
  {
    id: 'summarizer',
    label: 'AI Summarizer',
    icon: FileText
  },
  {
    id: 'quizzes',
    label: 'Quiz Generator',
    icon: Brain
  },
  {
    id: 'planner',
    label: 'Study Planner',
    icon: CalendarDays
  },
  {
    id: 'analytics',
    label: 'Progress & Analytics',
    icon: BarChart3
  },
  {
    id: 'recommendations',
    label: 'AI Recommendations',
    icon: Sparkles
  },
  {
    id: 'rag_qa',
    label: 'Document Q&A',
    icon: Database
  },
  {
    id: 'gamification',
    label: 'Achievements',
    icon: Trophy
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User
  }
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen = false,
  onClose
}) {
  const handleNavigation = (id) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(id);
    }

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <aside
      className={`sidebar ${isOpen ? 'open' : ''}`}
      aria-label="Study navigation"
    >
      {/* SIDEBAR HEADER */}
      <div className="sidebar-heading">
        <span>STUDY TOOLS</span>

        <button
          type="button"
          onClick={handleClose}
          className="btn-icon sidebar-close-btn"
          aria-label="Close navigation"
          title="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${
                active ? 'nav-item-active' : ''
              }`}
              onClick={() => handleNavigation(item.id)}
              aria-current={active ? 'page' : undefined}
            >
              <span className="nav-item-inner">
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                />

                <span>{item.label}</span>
              </span>

              {active && (
                <span
                  className="nav-active-dot"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <strong>Studyield AI</strong>
        <span>AI Education Assistant</span>
      </div>
    </aside>
  );
}
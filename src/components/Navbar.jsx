import React, { useEffect, useState } from 'react';
import {
  Flame,
  Award,
  Settings,
  LogOut,
  Menu,
  Globe2,
  Zap
} from 'lucide-react';
import { storageService } from '../services/storageService';

export default function Navbar({
  isLanding = false,
  onOpenAuth,
  onOpenSettings,
  onLogout,
  onNavigateDashboard,
  onNavigateSection,
  onToggleSidebar
}) {
  const [gamification, setGamification] = useState(
    storageService.getGamification()
  );

  const [profile, setProfile] = useState(
    storageService.getProfile()
  );

  useEffect(() => {
    const updateData = () => {
      setGamification(storageService.getGamification());
      setProfile(storageService.getProfile());
    };

    window.addEventListener('storage', updateData);

    const timer = setInterval(updateData, 1000);

    return () => {
      window.removeEventListener('storage', updateData);
      clearInterval(timer);
    };
  }, []);

  const totalXP = Number(gamification?.totalXP || 0);
  const level = Number(gamification?.level || 1);
  const streakDays = Number(gamification?.streakDays || 0);

  const xpCurrentLevel = totalXP % 500;
  const xpPercentage = Math.min(
    (xpCurrentLevel / 500) * 100,
    100
  );

  const profileName = profile?.name || 'Student';
  const profileAvatar = profile?.avatar || '👨‍🎓';

  const handleSectionClick = (section) => {
    if (typeof onNavigateSection === 'function') {
      onNavigateSection(section);
    }
  };

  const handleDashboardClick = () => {
    if (typeof onNavigateDashboard === 'function') {
      onNavigateDashboard();
    }
  };

  return (
    <header
      className={`app-navbar ${
        isLanding ? 'landing-navbar' : ''
      }`}
    >
      {/* LEFT SIDE */}
      <div className="navbar-left">

        {!isLanding && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="btn-icon mobile-menu-btn"
            aria-label="Open navigation"
            title="Open navigation"
          >
            <Menu size={20} />
          </button>
        )}

        <button
          type="button"
          className="brand-button"
          onClick={handleDashboardClick}
          aria-label="Go to dashboard"
        >
          <span className="brand-logo">🎓</span>

          <span className="brand-copy">
            <strong>Studyield</strong>
            <small>AI Education Assistant</small>
          </span>
        </button>
      </div>

      {/* LANDING NAVBAR */}
      {isLanding ? (
        <>
          <nav
            className="landing-nav"
            aria-label="Main navigation"
          >
            <button
              type="button"
              className="landing-nav-link active"
              onClick={() => handleSectionClick('features')}
            >
              Features <span>⌄</span>
            </button>

            <button
              type="button"
              className="landing-nav-link"
              onClick={() => handleSectionClick('pricing')}
            >
              Pricing
            </button>

            <button
              type="button"
              className="landing-nav-link"
              onClick={() => handleSectionClick('blog')}
            >
              Blog
            </button>

            <button
              type="button"
              className="landing-nav-link"
              onClick={() => handleSectionClick('tutorial')}
            >
              Tutorial
            </button>

            <button
              type="button"
              className="landing-nav-link"
              onClick={() => handleSectionClick('about')}
            >
              About
            </button>

            <button
              type="button"
              className="landing-nav-link"
              onClick={() => handleSectionClick('contact')}
            >
              Contact
            </button>
          </nav>

          {/* LANDING ACTIONS */}
          <div className="landing-actions">

            <button
              type="button"
              className="globe-button"
              title="Language"
              aria-label="Language"
            >
              <Globe2 size={20} />
            </button>

            <button
              type="button"
              className="sign-in-button"
              onClick={onOpenAuth}
            >
              Sign In
            </button>

            <button
              type="button"
              className="get-started-button"
              onClick={onOpenAuth}
            >
              <Zap
                size={16}
                fill="currentColor"
              />
              Get Started Free
            </button>

          </div>
        </>
      ) : (
        /* APP NAVBAR */
        <div className="navbar-actions">

          {/* STREAK */}
          <div className="navbar-stat-pill">
            <Flame
              size={18}
              color="#f59e0b"
              className="flame-pulse"
            />

            <span>
              {streakDays} Day Streak
            </span>
          </div>

          {/* XP */}
          <div className="xp-group">

            <span className="badge badge-purple">
              <Award size={13} />
              Lvl {level}
            </span>

            <div className="xp-bar-wrap">

              <div className="xp-bar-label">
                <span>XP</span>

                <span>
                  {xpCurrentLevel} / 500
                </span>
              </div>

              <div className="xp-bar-track">
                <div
                  className="xp-bar-fill"
                  style={{
                    width: `${xpPercentage}%`
                  }}
                />
              </div>

            </div>
          </div>

          {/* PROFILE */}
          <button
            type="button"
            onClick={onOpenAuth}
            className="profile-button"
            title="Student Profile"
          >
            <span>{profileAvatar}</span>

            <strong>
              {profileName.split(' ')[0] || 'Student'}
            </strong>
          </button>

          {/* SETTINGS */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="btn-icon"
            title="App Settings"
            aria-label="App Settings"
          >
            <Settings size={17} />
          </button>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={onLogout}
            className="btn-icon"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={17} />
          </button>

        </div>
      )}
    </header>
  );
}
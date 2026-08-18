// Gamification Engine for AI Study Assistant
import { storageService } from './storageService';
import confetti from 'canvas-confetti';

export const gamificationService = {
  // Trigger celebration effect
  triggerCelebration: () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti effect:', e);
    }
  },

  // Add XP and check level ups / badge unlocks
  addXP: (amount, reason = 'Study Activity') => {
    const data = storageService.getGamification();
    const oldLevel = data.level;
    
    data.totalXP += amount;
    data.level = Math.floor(data.totalXP / 500) + 1;
    
    const newLevel = data.level;
    const leveledUp = newLevel > oldLevel;

    // Check today's date for streak updates
    const today = new Date().toISOString().split('T')[0];
    if (data.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (data.lastStudyDate === yesterdayStr) {
        data.streakDays += 1;
      } else if (data.lastStudyDate !== today) {
        data.streakDays = 1;
      }
      data.lastStudyDate = today;
    }

    // Unlock streak badges if applicable
    if (data.streakDays >= 3) {
      gamificationService.unlockBadge('streak_3', data);
    }

    storageService.saveGamification(data);

    if (leveledUp) {
      gamificationService.triggerCelebration();
    }

    return {
      xpAdded: amount,
      totalXP: data.totalXP,
      level: data.level,
      leveledUp,
      reason
    };
  },

  // Unlock specific badge by ID
  unlockBadge: (badgeId, existingData = null) => {
    const data = existingData || storageService.getGamification();
    const badge = data.badges.find(b => b.id === badgeId);
    
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      badge.unlockedAt = new Date().toISOString().split('T')[0];
      storageService.saveGamification(data);
      gamificationService.triggerCelebration();
      return true;
    }
    return false;
  }
};

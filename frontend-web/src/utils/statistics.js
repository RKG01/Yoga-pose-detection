class Statistics {
  constructor() {
    this.storageKey = 'yogaStats'
    this.achievementsKey = 'yogaAchievements'
    this.loadStats()
  }

  loadStats() {
    const savedStats = localStorage.getItem(this.storageKey)
    this.stats = savedStats ? JSON.parse(savedStats) : {
      totalSessions: 0,
      totalTime: 0,
      bestScores: {},
      sessionsThisWeek: 0,
      currentStreak: 0,
      lastSessionDate: null,
      poseAttempts: {},
      perfectPoses: {},
      totalPerfectPoses: 0,
      longestHold: 0,
      averageAccuracy: 0,
      favoritesPoses: [],
      weeklyStats: {},
      monthlyStats: {}
    }

    const savedAchievements = localStorage.getItem(this.achievementsKey)
    this.achievements = savedAchievements ? JSON.parse(savedAchievements) : []
  }

  saveStats() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.stats))
    localStorage.setItem(this.achievementsKey, JSON.stringify(this.achievements))
  }

  // Session Management
  startSession(pose) {
    this.currentSession = {
      pose,
      startTime: Date.now(),
      bestHold: 0,
      attempts: 0,
      perfectHolds: 0,
      totalAccuracy: 0,
      accuracyReadings: 0
    }
  }

  updateSession(holdTime, accuracy) {
    if (!this.currentSession) return

    this.currentSession.bestHold = Math.max(this.currentSession.bestHold, holdTime)
    this.currentSession.totalAccuracy += accuracy
    this.currentSession.accuracyReadings++

    if (accuracy >= 97) {
      this.currentSession.perfectHolds++
    }
  }

  endSession() {
    if (!this.currentSession) return

    const session = this.currentSession
    const pose = session.pose
    const sessionDuration = (Date.now() - session.startTime) / 1000

    // Update overall stats
    this.stats.totalSessions++
    this.stats.totalTime += sessionDuration

    // Update pose-specific stats
    if (!this.stats.poseAttempts[pose]) {
      this.stats.poseAttempts[pose] = 0
    }
    this.stats.poseAttempts[pose]++

    // Update best scores
    if (!this.stats.bestScores[pose] || session.bestHold > this.stats.bestScores[pose]) {
      this.stats.bestScores[pose] = session.bestHold
    }

    // Update longest hold
    this.stats.longestHold = Math.max(this.stats.longestHold, session.bestHold)

    // Update perfect poses
    if (session.perfectHolds > 0) {
      if (!this.stats.perfectPoses[pose]) {
        this.stats.perfectPoses[pose] = 0
      }
      this.stats.perfectPoses[pose] += session.perfectHolds
      this.stats.totalPerfectPoses += session.perfectHolds
    }

    // Update average accuracy
    if (session.accuracyReadings > 0) {
      const sessionAverage = session.totalAccuracy / session.accuracyReadings
      this.stats.averageAccuracy = (this.stats.averageAccuracy * (this.stats.totalSessions - 1) + sessionAverage) / this.stats.totalSessions
    }

    // Update streak
    this.updateStreak()

    // Update weekly/monthly stats
    this.updatePeriodStats()

    // Check for achievements
    this.checkAchievements()

    this.saveStats()
    this.currentSession = null

    return {
      duration: sessionDuration,
      bestHold: session.bestHold,
      perfectHolds: session.perfectHolds,
      averageAccuracy: session.accuracyReadings > 0 ? session.totalAccuracy / session.accuracyReadings : 0
    }
  }

  updateStreak() {
    const today = new Date().toDateString()
    const lastSession = this.stats.lastSessionDate

    if (!lastSession) {
      this.stats.currentStreak = 1
    } else {
      const lastSessionDate = new Date(lastSession).toDateString()
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

      if (lastSessionDate === today) {
        // Same day, don't change streak
      } else if (lastSessionDate === yesterday) {
        // Consecutive day
        this.stats.currentStreak++
      } else {
        // Streak broken
        this.stats.currentStreak = 1
      }
    }

    this.stats.lastSessionDate = today
  }

  updatePeriodStats() {
    const now = new Date()
    const weekKey = this.getWeekKey(now)
    const monthKey = this.getMonthKey(now)

    // Weekly stats
    if (!this.stats.weeklyStats[weekKey]) {
      this.stats.weeklyStats[weekKey] = { sessions: 0, time: 0 }
    }
    this.stats.weeklyStats[weekKey].sessions++
    this.stats.weeklyStats[weekKey].time += (Date.now() - this.currentSession.startTime) / 1000

    // Monthly stats
    if (!this.stats.monthlyStats[monthKey]) {
      this.stats.monthlyStats[monthKey] = { sessions: 0, time: 0 }
    }
    this.stats.monthlyStats[monthKey].sessions++
    this.stats.monthlyStats[monthKey].time += (Date.now() - this.currentSession.startTime) / 1000

    // Update sessions this week
    this.stats.sessionsThisWeek = this.stats.weeklyStats[weekKey].sessions
  }

  getWeekKey(date) {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    return startOfWeek.toISOString().split('T')[0]
  }

  getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  // Achievement System
  checkAchievements() {
    const newAchievements = []

    // First Perfect Pose
    if (!this.hasAchievement('first_perfect') && this.stats.totalPerfectPoses > 0) {
      newAchievements.push('first_perfect')
    }

    // Pose Master (perfect all poses)
    if (!this.hasAchievement('pose_master') && Object.keys(this.stats.perfectPoses).length >= 7) {
      newAchievements.push('pose_master')
    }

    // 7-Day Streak
    if (!this.hasAchievement('streak_7') && this.stats.currentStreak >= 7) {
      newAchievements.push('streak_7')
    }

    // Time Master (30+ seconds)
    if (!this.hasAchievement('time_master') && this.stats.longestHold >= 30) {
      newAchievements.push('time_master')
    }

    // Dedicated Practitioner (100 sessions)
    if (!this.hasAchievement('dedicated') && this.stats.totalSessions >= 100) {
      newAchievements.push('dedicated')
    }

    // Consistency King (30-day streak)
    if (!this.hasAchievement('consistency_king') && this.stats.currentStreak >= 30) {
      newAchievements.push('consistency_king')
    }

    // Accuracy Expert (95% average)
    if (!this.hasAchievement('accuracy_expert') && this.stats.averageAccuracy >= 95) {
      newAchievements.push('accuracy_expert')
    }

    // Add new achievements
    newAchievements.forEach(achievement => {
      if (!this.achievements.includes(achievement)) {
        this.achievements.push(achievement)
      }
    })

    return newAchievements
  }

  hasAchievement(achievementId) {
    return this.achievements.includes(achievementId)
  }

  // Getters
  getStats() {
    return { ...this.stats }
  }

  getAchievements() {
    return [...this.achievements]
  }

  getBestScore(pose) {
    return this.stats.bestScores[pose] || 0
  }

  getTotalTime() {
    return this.stats.totalTime
  }

  getCurrentStreak() {
    return this.stats.currentStreak
  }

  getWeeklyProgress() {
    const thisWeek = this.getWeekKey(new Date())
    return this.stats.weeklyStats[thisWeek] || { sessions: 0, time: 0 }
  }

  getMonthlyProgress() {
    const thisMonth = this.getMonthKey(new Date())
    return this.stats.monthlyStats[thisMonth] || { sessions: 0, time: 0 }
  }

  // Get favorite poses (most practiced)
  getFavoritePoses() {
    const poses = Object.entries(this.stats.poseAttempts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([pose]) => pose)
    
    return poses
  }

  // Get improvement suggestions
  getImprovementSuggestions() {
    const suggestions = []

    if (this.stats.currentStreak === 0) {
      suggestions.push("Start a daily practice streak!")
    } else if (this.stats.currentStreak < 7) {
      suggestions.push(`Keep going! You're ${7 - this.stats.currentStreak} days away from a 7-day streak.`)
    }

    if (this.stats.averageAccuracy < 90) {
      suggestions.push("Focus on form and accuracy to improve your poses.")
    }

    if (this.stats.longestHold < 20) {
      suggestions.push("Try to hold poses longer for better strength and stability.")
    }

    const untriedPoses = ['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand', 'Triangle']
      .filter(pose => !this.stats.poseAttempts[pose])

    if (untriedPoses.length > 0) {
      suggestions.push(`Try new poses: ${untriedPoses.slice(0, 2).join(', ')}`)
    }

    return suggestions
  }

  // Clear all data
  clearAllData() {
    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.achievementsKey)
    this.loadStats()
  }
}

const statisticsInstance = new Statistics()
export default statisticsInstance
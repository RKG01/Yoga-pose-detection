import React, { useState, useEffect } from 'react'
import './Progress.css'

export default function Progress() {
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    totalTime: 0,
    bestScores: {},
    sessionsThisWeek: 0,
    currentStreak: 0
  })

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('yogaStats')
    if (savedStats) {
      setUserStats(JSON.parse(savedStats))
    }
  }, [])

  return (
    <div className="progress-container">
      <h1>Your Yoga Journey</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{userStats.totalSessions}</h3>
          <p>Total Sessions</p>
        </div>
        
        <div className="stat-card">
          <h3>{Math.round(userStats.totalTime / 60)}m</h3>
          <p>Total Practice Time</p>
        </div>
        
        <div className="stat-card">
          <h3>{userStats.currentStreak}</h3>
          <p>Day Streak</p>
        </div>
        
        <div className="stat-card">
          <h3>{userStats.sessionsThisWeek}</h3>
          <p>This Week</p>
        </div>
      </div>

      <div className="best-scores">
        <h2>Personal Bests</h2>
        {Object.entries(userStats.bestScores).map(([pose, time]) => (
          <div key={pose} className="score-item">
            <span>{pose}</span>
            <span>{time.toFixed(1)}s</span>
          </div>
        ))}
      </div>
    </div>
  )
}
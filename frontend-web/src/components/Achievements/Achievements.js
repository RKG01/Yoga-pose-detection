import { useState, useEffect } from 'react'
import './Achievements.css'

const achievements = [
  {
    id: 'first_perfect',
    title: 'First Perfect Pose',
    description: 'Achieve 97% accuracy on any pose',
    icon: '🎯',
    condition: (stats) => Object.values(stats.bestScores).some(score => score >= 10)
  },
  {
    id: 'pose_master',
    title: 'Pose Master',
    description: 'Perfect all 7 yoga poses',
    icon: '🧘‍♀️',
    condition: (stats) => Object.keys(stats.bestScores).length >= 7
  },
  {
    id: 'streak_7',
    title: '7-Day Warrior',
    description: 'Practice yoga for 7 consecutive days',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'time_master',
    title: 'Time Master',
    description: 'Hold a pose for 30+ seconds',
    icon: '⏰',
    condition: (stats) => Object.values(stats.bestScores).some(score => score >= 30)
  }
]

export default function Achievements({ userStats }) {
  const [unlockedAchievements, setUnlockedAchievements] = useState([])

  useEffect(() => {
    const unlocked = achievements.filter(achievement => 
      achievement.condition(userStats)
    )
    setUnlockedAchievements(unlocked)
  }, [userStats])

  return (
    <div className="achievements-container">
      <h2>Achievements</h2>
      <div className="achievements-grid">
        {achievements.map(achievement => {
          const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id)
          return (
            <div 
              key={achievement.id} 
              className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              {isUnlocked && <div className="unlock-badge">✓ Unlocked!</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
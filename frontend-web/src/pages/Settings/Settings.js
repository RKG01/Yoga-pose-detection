import { useState, useEffect } from 'react'
import './Settings.css'

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    difficulty: 'intermediate',
    voiceFeedback: true,
    soundEffects: true,
    confidenceThreshold: 95,
    holdTime: 20,
    language: 'english'
  })

  useEffect(() => {
    const savedSettings = localStorage.getItem('yogaSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('yogaSettings', JSON.stringify(newSettings))
    
    // Apply theme immediately
    if (key === 'theme') {
      document.body.className = value === 'dark' ? 'dark-theme' : 'light-theme'
    }
  }

  const difficultySettings = {
    beginner: { holdTime: 10, accuracy: 90, description: 'Perfect for starting your journey' },
    intermediate: { holdTime: 20, accuracy: 95, description: 'Good balance of challenge and achievability' },
    advanced: { holdTime: 30, accuracy: 97, description: 'For experienced practitioners' }
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      
      <div className="settings-sections">
        
        {/* Appearance */}
        <div className="settings-section">
          <h2>🎨 Appearance</h2>
          
          <div className="setting-item">
            <label>Theme</label>
            <div className="theme-toggle">
              <button 
                className={settings.theme === 'dark' ? 'active' : ''}
                onClick={() => updateSetting('theme', 'dark')}
              >
                🌙 Dark
              </button>
              <button 
                className={settings.theme === 'light' ? 'active' : ''}
                onClick={() => updateSetting('theme', 'light')}
              >
                ☀️ Light
              </button>
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="settings-section">
          <h2>🎯 Difficulty</h2>
          
          <div className="setting-item">
            <label>Practice Level</label>
            <div className="difficulty-selector">
              {Object.entries(difficultySettings).map(([level, config]) => (
                <div 
                  key={level}
                  className={`difficulty-option ${settings.difficulty === level ? 'selected' : ''}`}
                  onClick={() => updateSetting('difficulty', level)}
                >
                  <h4>{level.charAt(0).toUpperCase() + level.slice(1)}</h4>
                  <p>{config.description}</p>
                  <div className="difficulty-stats">
                    <span>Hold: {config.holdTime}s</span>
                    <span>Accuracy: {config.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audio */}
        <div className="settings-section">
          <h2>🔊 Audio</h2>
          
          <div className="setting-item">
            <label>Voice Feedback</label>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.voiceFeedback}
                onChange={(e) => updateSetting('voiceFeedback', e.target.checked)}
              />
              <span className="slider"></span>
            </div>
          </div>
          
          <div className="setting-item">
            <label>Sound Effects</label>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.soundEffects}
                onChange={(e) => updateSetting('soundEffects', e.target.checked)}
              />
              <span className="slider"></span>
            </div>
          </div>
        </div>

        {/* Advanced */}
        <div className="settings-section">
          <h2>⚙️ Advanced</h2>
          
          <div className="setting-item">
            <label>Confidence Threshold: {settings.confidenceThreshold}%</label>
            <input 
              type="range"
              min="80"
              max="99"
              value={settings.confidenceThreshold}
              onChange={(e) => updateSetting('confidenceThreshold', parseInt(e.target.value))}
              className="slider-input"
            />
          </div>
          
          <div className="setting-item">
            <label>Minimum Hold Time: {settings.holdTime}s</label>
            <input 
              type="range"
              min="5"
              max="60"
              value={settings.holdTime}
              onChange={(e) => updateSetting('holdTime', parseInt(e.target.value))}
              className="slider-input"
            />
          </div>
        </div>

        {/* Data */}
        <div className="settings-section">
          <h2>📊 Data</h2>
          
          <div className="setting-item">
            <button 
              className="danger-btn"
              onClick={() => {
                if (window.confirm('Are you sure? This will delete all your progress data.')) {
                  localStorage.removeItem('yogaStats')
                  localStorage.removeItem('yogaAchievements')
                  alert('Data cleared successfully!')
                }
              }}
            >
              Clear All Data
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
class VoiceFeedback {
  constructor() {
    this.isEnabled = true
    this.rate = 0.8
    this.pitch = 1
    this.volume = 0.8
    
    // Load settings from localStorage
    const settings = localStorage.getItem('yogaSettings')
    if (settings) {
      const parsedSettings = JSON.parse(settings)
      this.isEnabled = parsedSettings.voiceFeedback !== false
    }
  }

  speak(message) {
    if (!this.isEnabled || !('speechSynthesis' in window)) {
      return
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(message)
    utterance.rate = this.rate
    utterance.pitch = this.pitch
    utterance.volume = this.volume
    
    speechSynthesis.speak(utterance)
  }

  // Pose-specific feedback messages
  getPoseStartMessage(pose) {
    const messages = {
      'Tree': 'Get ready for Tree pose. Stand tall and find your balance.',
      'Chair': 'Prepare for Chair pose. Sit back like you\'re sitting in a chair.',
      'Cobra': 'Time for Cobra pose. Lie down and lift your chest.',
      'Warrior': 'Warrior pose ready. Step into your power stance.',
      'Dog': 'Downward Dog position. Create an inverted V with your body.',
      'Shoulderstand': 'Shoulderstand pose. Lift your legs up high.',
      'Triangle': 'Triangle pose. Reach to the side and create triangular shapes.'
    }
    return messages[pose] || `Get ready for ${pose} pose.`
  }

  getConfidenceMessage(confidence) {
    if (confidence >= 97) {
      const perfectMessages = [
        'Perfect! Hold this pose.',
        'Excellent form! Keep it up.',
        'Outstanding! You\'ve got it.',
        'Beautiful pose! Stay strong.'
      ]
      return perfectMessages[Math.floor(Math.random() * perfectMessages.length)]
    } else if (confidence >= 90) {
      const goodMessages = [
        'Great job! Almost perfect.',
        'Very good! Small adjustments needed.',
        'Nice work! You\'re very close.',
        'Well done! Fine-tune your position.'
      ]
      return goodMessages[Math.floor(Math.random() * goodMessages.length)]
    } else if (confidence >= 80) {
      const okMessages = [
        'Good effort! Keep adjusting.',
        'You\'re getting there! Keep trying.',
        'Nice attempt! Make some adjustments.',
        'Keep going! You\'re on the right track.'
      ]
      return okMessages[Math.floor(Math.random() * okMessages.length)]
    } else {
      const encouragementMessages = [
        'Keep trying! You can do this.',
        'Don\'t give up! Adjust your position.',
        'Take your time. Find the right position.',
        'Breathe and focus. You\'ve got this.'
      ]
      return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
    }
  }

  getAchievementMessage(achievement) {
    return `Congratulations! You've unlocked ${achievement}!`
  }

  getSessionCompleteMessage(duration, bestScore) {
    return `Session complete! You practiced for ${duration} seconds with a best score of ${bestScore}%.`
  }

  // Breathing guidance
  startBreathingGuide() {
    if (!this.isEnabled) return

    let breathCount = 0
    const maxBreaths = 5

    const breathingInterval = setInterval(() => {
      if (breathCount >= maxBreaths) {
        clearInterval(breathingInterval)
        this.speak('Breathing exercise complete. You\'re ready to begin.')
        return
      }

      if (breathCount % 2 === 0) {
        this.speak('Breathe in slowly')
      } else {
        this.speak('Breathe out slowly')
      }
      breathCount++
    }, 3000)
  }

  // Pose correction suggestions
  getPoseCorrectionMessage(pose) {
    const corrections = {
      'Tree': [
        'Press your foot firmly against your leg.',
        'Engage your core for better balance.',
        'Focus on a point ahead of you.',
        'Keep your standing leg strong.'
      ],
      'Chair': [
        'Sit back deeper, like sitting in a chair.',
        'Keep your knees aligned over your ankles.',
        'Lift your arms higher.',
        'Engage your core muscles.'
      ],
      'Cobra': [
        'Lift your chest higher.',
        'Keep your shoulders away from your ears.',
        'Press your palms down firmly.',
        'Engage your back muscles.'
      ],
      'Warrior': [
        'Step your feet wider apart.',
        'Bend your front knee deeper.',
        'Keep your back leg straight.',
        'Reach your arms up higher.'
      ],
      'Dog': [
        'Press your hands down firmly.',
        'Lift your hips higher.',
        'Straighten your legs more.',
        'Create a straight line from hands to hips.'
      ],
      'Shoulderstand': [
        'Lift your legs higher.',
        'Support your back with your hands.',
        'Keep your legs straight.',
        'Engage your core muscles.'
      ],
      'Triangle': [
        'Reach further to the side.',
        'Keep your front leg straight.',
        'Open your chest to the side.',
        'Extend your top arm up.'
      ]
    }

    const poseCorrections = corrections[pose] || ['Adjust your position and try again.']
    const randomCorrection = poseCorrections[Math.floor(Math.random() * poseCorrections.length)]
    
    return randomCorrection
  }

  setEnabled(enabled) {
    this.isEnabled = enabled
  }

  setRate(rate) {
    this.rate = Math.max(0.1, Math.min(2.0, rate))
  }

  setPitch(pitch) {
    this.pitch = Math.max(0, Math.min(2, pitch))
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }
}

const voiceFeedbackInstance = new VoiceFeedback()
export default voiceFeedbackInstance
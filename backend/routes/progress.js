const express = require('express');
const { body, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get user progress
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.userId });
    
    // Create progress record if it doesn't exist
    if (!progress) {
      progress = new Progress({ userId: req.userId });
      await progress.save();
    }

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/progress/session
// @desc    Add a new session
// @access  Private
router.post('/session', [
  auth,
  body('pose').isIn(['Tree', 'Chair', 'Cobra', 'Warrior', 'Dog', 'Shoulderstand', 'Triangle']),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('bestHold').isNumeric(),
  body('averageAccuracy').isNumeric(),
  body('perfectHolds').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let progress = await Progress.findOne({ userId: req.userId });
    
    if (!progress) {
      progress = new Progress({ userId: req.userId });
    }

    // Add session
    await progress.addSession(req.body);

    res.json({
      success: true,
      message: 'Session added successfully',
      progress
    });

  } catch (error) {
    console.error('Add session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/progress/achievement
// @desc    Add a new achievement
// @access  Private
router.post('/achievement', [
  auth,
  body('achievementId').notEmpty(),
  body('title').notEmpty(),
  body('description').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let progress = await Progress.findOne({ userId: req.userId });
    
    if (!progress) {
      progress = new Progress({ userId: req.userId });
    }

    // Add achievement
    const isNew = progress.addAchievement(req.body);
    await progress.save();

    res.json({
      success: true,
      message: isNew ? 'Achievement unlocked!' : 'Achievement already exists',
      isNew,
      progress
    });

  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.userId });
    
    if (!progress) {
      return res.json({
        success: true,
        stats: {
          totalSessions: 0,
          totalTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageAccuracy: 0,
          totalPerfectPoses: 0,
          longestHold: 0,
          favoritePoses: [],
          achievements: []
        }
      });
    }

    // Recalculate stats to ensure they're up to date
    progress.calculateStats();
    await progress.save();

    const stats = {
      totalSessions: progress.totalSessions,
      totalTime: progress.totalTime,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      averageAccuracy: progress.averageAccuracy,
      totalPerfectPoses: progress.totalPerfectPoses,
      longestHold: progress.longestHold,
      favoritePoses: progress.favoritePoses,
      achievements: progress.achievements,
      poseStats: progress.poseStats,
      lastSessionDate: progress.lastSessionDate
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/sessions
// @desc    Get user session history
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, pose } = req.query;
    
    const progress = await Progress.findOne({ userId: req.userId });
    
    if (!progress) {
      return res.json({
        success: true,
        sessions: [],
        totalSessions: 0,
        currentPage: 1,
        totalPages: 0
      });
    }

    let sessions = progress.sessions;
    
    // Filter by pose if specified
    if (pose) {
      sessions = sessions.filter(session => session.pose === pose);
    }

    // Sort by date (newest first)
    sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSessions = sessions.slice(startIndex, endIndex);

    res.json({
      success: true,
      sessions: paginatedSessions,
      totalSessions: sessions.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(sessions.length / limit)
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/progress
// @desc    Clear all progress data
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    await Progress.findOneAndDelete({ userId: req.userId });

    res.json({
      success: true,
      message: 'Progress data cleared successfully'
    });

  } catch (error) {
    console.error('Clear progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
import express from 'express';
import db from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/save', authenticate, (req: AuthRequest, res) => {
  const { wpm, rawWpm, accuracy, errors, duration, mode, details } = req.body;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const insertTest = db.prepare(`
      INSERT INTO typing_tests (userId, wpm, rawWpm, accuracy, errors, duration, mode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = insertTest.run(userId, wpm, rawWpm, accuracy, errors, duration, mode);
    const testId = info.lastInsertRowid;

    if (details && Array.isArray(details)) {
      const insertDetail = db.prepare(`
        INSERT INTO typing_details (testId, second, wpm, accuracy)
        VALUES (?, ?, ?, ?)
      `);
      
      const insertMany = db.transaction((details) => {
        for (const detail of details) {
          insertDetail.run(testId, detail.second, detail.wpm, detail.accuracy);
        }
      });
      
      insertMany(details);
    }

    res.status(201).json({ success: true, testId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', authenticate, (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const stmt = db.prepare('SELECT * FROM typing_tests WHERE userId = ? ORDER BY createdAt DESC LIMIT 50');
    const history = stmt.all(userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', authenticate, (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const stats = db.prepare(`
      SELECT 
        AVG(wpm) as avgWpm, 
        MAX(wpm) as bestWpm, 
        COUNT(id) as totalTests, 
        SUM(duration) as totalTime, 
        AVG(accuracy) as avgAccuracy 
      FROM typing_tests 
      WHERE userId = ?
    `).get(userId);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

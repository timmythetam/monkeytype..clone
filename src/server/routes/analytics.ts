import express from 'express';
import db from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/wpm-history', authenticate, (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const history = db.prepare(`
      SELECT createdAt as date, wpm 
      FROM typing_tests 
      WHERE userId = ? 
      ORDER BY createdAt ASC 
      LIMIT 100
    `).all(userId);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/accuracy-history', authenticate, (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const history = db.prepare(`
      SELECT createdAt as date, accuracy 
      FROM typing_tests 
      WHERE userId = ? 
      ORDER BY createdAt ASC 
      LIMIT 100
    `).all(userId);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

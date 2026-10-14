import { Router, Response } from 'express';
import { db, Transaction } from '../db.js';
import { authenticateToken, AuthRequest } from '../auth.js';

const router = Router();
const HYPOTHETICAL_RATE = 0.30; // 30% daily growth multiplier 1.30

export interface DailyProjection {
  day: number;
  dateStr: string;
  startingBalance: number;
  dailyGain: number;
  endingBalance: number;
}

// POST /api/simulator/calculate
router.post('/calculate', (req, res) => {
  try {
    const { startingAmount, days = 7 } = req.body;
    const initial = parseFloat(startingAmount);
    const duration = Math.min(Math.max(parseInt(days, 10) || 7, 1), 30);

    if (isNaN(initial) || initial <= 0) {
      res.status(400).json({ error: 'Please enter a valid starting balance (e.g., GH₵100).' });
      return;
    }

    const projections: DailyProjection[] = [];
    let currentBalance = initial;
    const startDate = new Date();

    for (let day = 1; day <= duration; day++) {
      const prev = currentBalance;
      // Formula: New simulated balance = Previous simulated balance * 1.30
      const next = prev * (1 + HYPOTHETICAL_RATE);
      const gain = next - prev;

      const dateObj = new Date(startDate);
      dateObj.setDate(startDate.getDate() + day);

      projections.push({
        day,
        dateStr: dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        startingBalance: Math.round(prev * 100) / 100,
        dailyGain: Math.round(gain * 100) / 100,
        endingBalance: Math.round(next * 100) / 100,
      });

      currentBalance = next;
    }

    const totalHypotheticalProfit = currentBalance - initial;
    const finalProjected = Math.round(currentBalance * 100) / 100;

    res.json({
      startingAmount: initial,
      days: duration,
      dailyRate: HYPOTHETICAL_RATE,
      dailyRatePercentage: '30%',
      formula: 'New simulated balance = Previous simulated balance × 1.30',
      finalProjected,
      totalHypotheticalProfit: Math.round(totalHypotheticalProfit * 100) / 100,
      projections,
      disclaimer:
        'DISCLAIMER: The 30% daily rate is strictly hypothetical and intended solely for mathematical demonstration and educational purposes. It does NOT represent actual investment returns or guarantees. Rich Money strictly isolates demo balances from real withdrawable funds in accordance with financial regulations.',
    });
  } catch (err: any) {
    console.error('Calculation error:', err);
    res.status(500).json({ error: 'Failed to compute projection.' });
  }
});

// POST /api/simulator/start-demo-investment
router.post('/start-demo-investment', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { amount } = req.body;
    const investAmount = parseFloat(amount);

    if (isNaN(investAmount) || investAmount <= 0) {
      res.status(400).json({ error: 'Invalid investment amount.' });
      return;
    }

    const user = db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (user.demoBalance < investAmount) {
      res.status(400).json({
        error: `Insufficient demo balance. You have GH₵${user.demoBalance.toFixed(2)} in demo credits.`,
      });
      return;
    }

    // Allocate demo capital
    const updatedUser = db.updateUser(user.id, {
      demoInvested: user.demoInvested + investAmount,
    });

    const tx: Transaction = {
      id: `tx_sim_inv_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      type: 'demo_investment',
      mode: 'demo',
      amount: investAmount,
      currency: 'GHS',
      paymentMethod: 'demo_wallet',
      paymentReference: `SIM-ALLOC-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'successful',
      notes: `Allocated GH₵${investAmount.toFixed(2)} demo capital to the 30% hypothetical daily simulator.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createTransaction(tx);

    res.json({
      message: `Allocated GH₵${investAmount.toFixed(2)} to demo growth simulator.`,
      user: {
        demoBalance: updatedUser?.demoBalance,
        demoInvested: updatedUser?.demoInvested,
      },
    });
  } catch (err: any) {
    console.error('Start demo investment error:', err);
    res.status(500).json({ error: 'Failed to initialize demo allocation.' });
  }
});

// POST /api/simulator/simulate-step
// Simulates 1 day of 30% growth on user's active demo invested balance
router.post('/simulate-step', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const user = db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Base for calculation: if demoInvested is > 0, grow that, else grow demoBalance
    const base = user.demoInvested > 0 ? user.demoInvested : user.demoBalance;
    if (base <= 0) {
      res.status(400).json({
        error: 'Demo balance is 0. Reset demo balance to test simulation.',
      });
      return;
    }

    // Formula: New balance = Previous balance * 1.30
    const hypotheticalGain = Math.round(base * HYPOTHETICAL_RATE * 100) / 100;
    const newDemoBalance = Math.round((user.demoBalance + hypotheticalGain) * 100) / 100;

    const updatedUser = db.updateUser(user.id, {
      demoBalance: newDemoBalance,
    });

    const tx: Transaction = {
      id: `tx_sim_gain_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.fullName,
      type: 'demo_growth',
      mode: 'demo',
      amount: hypotheticalGain,
      currency: 'GHS',
      paymentMethod: 'demo_wallet',
      paymentReference: `SIM-YIELD-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'successful',
      notes: `Simulated 1-day 30% hypothetical compound growth (+GH₵${hypotheticalGain.toFixed(2)}). Not real money.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createTransaction(tx);

    res.json({
      message: `Simulated 1 day growth: +GH₵${hypotheticalGain.toFixed(2)} (Hypothetical +30%)`,
      hypotheticalGain,
      newDemoBalance: updatedUser?.demoBalance,
      transaction: tx,
    });
  } catch (err: any) {
    console.error('Simulate step error:', err);
    res.status(500).json({ error: 'Failed to simulate step.' });
  }
});

export default router;

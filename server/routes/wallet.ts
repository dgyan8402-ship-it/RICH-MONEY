import { Router, Response } from 'express';
import { db, Transaction } from '../db.js';
import { authenticateToken, AuthRequest } from '../auth.js';

const router = Router();
const MINIMUM_WITHDRAWAL_THRESHOLD = 100.0; // GH₵ 100 minimum threshold

// GET /api/wallet/summary
router.get('/summary', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  // Reload fresh user state
  const user = db.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const demoEligible = user.demoBalance >= MINIMUM_WITHDRAWAL_THRESHOLD;
  const realEligible = user.realBalance >= MINIMUM_WITHDRAWAL_THRESHOLD;

  res.json({
    currency: 'GHS',
    currencySymbol: 'GH₵',
    threshold: MINIMUM_WITHDRAWAL_THRESHOLD,
    real: {
      balance: user.realBalance,
      withdrawable: user.realBalance,
      totalDeposited: user.totalDeposited,
      totalWithdrawn: user.totalWithdrawn,
      isThresholdReached: realEligible,
      kycStatus: user.kycStatus,
    },
    demo: {
      balance: user.demoBalance,
      invested: user.demoInvested,
      isThresholdReached: demoEligible,
      thresholdNotice: demoEligible
        ? 'Your demo balance has reached the threshold.'
        : 'Your demo balance has not reached the minimum withdrawal threshold of GH₵100.',
    },
  });
});

// GET /api/wallet/transactions
router.get('/transactions', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const mode = req.query.mode as 'real' | 'demo' | undefined;
  const transactions = db.getTransactions({ userId: req.user.id, mode });
  res.json({ transactions });
});

// POST /api/wallet/deposit/initiate
router.post('/deposit/initiate', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { amount, paymentMethod, phone, network } = req.body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount < 10) {
      res.status(400).json({ error: 'Minimum deposit amount is GH₵10.00' });
      return;
    }

    if (!paymentMethod) {
      res.status(400).json({ error: 'Payment method is required.' });
      return;
    }

    // Generate unique payment reference
    const prefix =
      paymentMethod === 'mtn_momo'
        ? 'MTN-GH'
        : paymentMethod === 'telecel_cash'
        ? 'TEL-GH'
        : paymentMethod === 'at_money'
        ? 'ATM-GH'
        : 'CRD-GH';
    const reference = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.fullName,
      type: 'deposit',
      mode: 'real',
      amount: parsedAmount,
      currency: 'GHS',
      paymentMethod,
      paymentReference: reference,
      status: 'pending',
      channelDetails: {
        phone: phone || req.user.phone,
        network: network || paymentMethod,
      },
      notes: 'Sandbox payment transaction initiated. Pending gateway confirmation.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createTransaction(newTx);

    db.logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'DEPOSIT_INITIATED',
      details: `Initiated deposit of GH₵${parsedAmount.toFixed(2)} via ${paymentMethod} (Ref: ${reference}).`,
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      severity: 'info',
    });

    res.status(201).json({
      message: 'Payment session created.',
      transaction: newTx,
      sandboxInstructions: {
        ussdPrompt:
          paymentMethod === 'mtn_momo'
            ? 'Dial *170# > My Approvals or approve the prompt on your phone'
            : paymentMethod === 'telecel_cash'
            ? 'Dial *110# to authorize Telecel Cash'
            : 'Authorize via your mobile wallet app',
        reference,
      },
    });
  } catch (err: any) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: 'Failed to initiate deposit.' });
  }
});

// POST /api/wallet/deposit/verify-sandbox
// Real sandbox settlement handler. Requires backend execution (never trusts client claims blindly)
router.post('/deposit/verify-sandbox', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { transactionId, action } = req.body; // action: 'approve' | 'decline'
    if (!transactionId) {
      res.status(400).json({ error: 'Transaction ID is required.' });
      return;
    }

    const tx = db.getTransactionById(transactionId);
    if (!tx || tx.userId !== req.user.id) {
      res.status(404).json({ error: 'Transaction not found.' });
      return;
    }

    if (tx.status !== 'pending') {
      res.status(400).json({ error: `Transaction is already finalized with status: ${tx.status}` });
      return;
    }

    if (action === 'approve') {
      // Finalize deposit: credit user's real balance and total deposits
      const user = db.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      const updatedUser = db.updateUser(user.id, {
        realBalance: user.realBalance + tx.amount,
        totalDeposited: user.totalDeposited + tx.amount,
      });

      const updatedTx = db.updateTransaction(tx.id, {
        status: 'successful',
        notes: 'Deposit confirmed by sandbox provider gateway settlement.',
      });

      db.logAudit({
        userId: user.id,
        userEmail: user.email,
        action: 'DEPOSIT_SETTLED_SUCCESS',
        details: `Credited GH₵${tx.amount.toFixed(2)} to real balance. (Ref: ${tx.paymentReference})`,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        severity: 'info',
      });

      res.json({
        message: 'Deposit confirmed and credited to your account.',
        transaction: updatedTx,
        newRealBalance: updatedUser?.realBalance,
      });
    } else {
      // Decline/Fail
      const updatedTx = db.updateTransaction(tx.id, {
        status: 'failed',
        notes: 'User or provider cancelled the sandbox authorization.',
      });

      db.logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'DEPOSIT_FAILED',
        details: `Sandbox deposit failed/declined for GH₵${tx.amount.toFixed(2)}.`,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        severity: 'warning',
      });

      res.json({
        message: 'Deposit was declined or timed out.',
        transaction: updatedTx,
      });
    }
  } catch (err: any) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Failed to settle transaction.' });
  }
});

// POST /api/wallet/withdraw
router.post('/withdraw', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { amount, mode, paymentMethod, phone, accountName, bankName } = req.body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Please enter a valid withdrawal amount.' });
      return;
    }

    const user = db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // --- DEMO MODE WITHDRAWAL RULES ---
    if (mode === 'demo') {
      if (user.demoBalance < MINIMUM_WITHDRAWAL_THRESHOLD) {
        res.status(400).json({
          error: 'Your demo balance has not reached the minimum withdrawal threshold of GH₵100.',
          currentBalance: user.demoBalance,
          threshold: MINIMUM_WITHDRAWAL_THRESHOLD,
        });
        return;
      }

      if (parsedAmount > user.demoBalance) {
        res.status(400).json({
          error: `Requested amount GH₵${parsedAmount.toFixed(2)} exceeds available demo balance of GH₵${user.demoBalance.toFixed(2)}.`,
        });
        return;
      }

      // Deduct from demo balance
      const newDemoBalance = user.demoBalance - parsedAmount;
      db.updateUser(user.id, { demoBalance: newDemoBalance });

      const tx: Transaction = {
        id: `tx_dm_wd_${Date.now()}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        type: 'demo_withdrawal',
        mode: 'demo',
        amount: parsedAmount,
        currency: 'GHS',
        paymentMethod: paymentMethod || 'demo_wallet',
        paymentReference: `DEMO-WD-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'successful',
        channelDetails: {
          phone: phone || user.phone,
          accountName: accountName || user.fullName,
          network: 'Demo Mobile Network',
        },
        notes:
          'DEMO WITHDRAWAL: Simulated request for testing and demonstration. Demo balances do not represent real financial transactions.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.createTransaction(tx);

      res.status(201).json({
        message: 'Your demo balance has reached the threshold.',
        subMessage: 'Demo withdrawal simulated successfully. (Notice: Demo funds are not real money).',
        transaction: tx,
        newDemoBalance,
      });
      return;
    }

    // --- REAL MODE WITHDRAWAL RULES ---
    if (mode === 'real') {
      if (parsedAmount < MINIMUM_WITHDRAWAL_THRESHOLD) {
        res.status(400).json({
          error: `Minimum withdrawal amount is GH₵${MINIMUM_WITHDRAWAL_THRESHOLD.toFixed(2)}.`,
        });
        return;
      }

      if (user.realBalance < parsedAmount) {
        res.status(400).json({
          error: `Insufficient available funds. Your withdrawable balance is GH₵${user.realBalance.toFixed(2)}.`,
        });
        return;
      }

      // Fraud Prevention checks:
      if (user.kycStatus === 'unverified' && parsedAmount > 500) {
        res.status(403).json({
          error: 'Ghana Card verification required for withdrawals exceeding GH₵500.00. Please complete verification in your Profile.',
        });
        return;
      }

      // Deduct from user's real balance and mark as pending for review/settlement
      const newRealBalance = user.realBalance - parsedAmount;
      db.updateUser(user.id, { realBalance: newRealBalance });

      const tx: Transaction = {
        id: `tx_wd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        type: 'withdrawal',
        mode: 'real',
        amount: parsedAmount,
        currency: 'GHS',
        paymentMethod: paymentMethod || 'mtn_momo',
        paymentReference: `WDL-GH-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'pending',
        channelDetails: {
          phone: phone || user.phone,
          accountName: accountName || user.fullName,
          bankName,
        },
        notes: 'Real withdrawal request submitted. Pending automated risk evaluation & payout gateway.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.createTransaction(tx);

      db.logAudit({
        userId: user.id,
        userEmail: user.email,
        action: 'REAL_WITHDRAWAL_REQUESTED',
        details: `Requested withdrawal of GH₵${parsedAmount.toFixed(2)} to ${phone || 'wallet'}. Pending admin clearance.`,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        severity: 'warning',
      });

      res.status(201).json({
        message: 'Withdrawal request submitted for review.',
        transaction: tx,
        newRealBalance,
      });
      return;
    }

    res.status(400).json({ error: 'Invalid mode specified. Must be "demo" or "real".' });
  } catch (err: any) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Failed to process withdrawal request.' });
  }
});

// POST /api/wallet/demo/reset
// Allows user to reset demo simulator balance
router.post('/demo/reset', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const defaultDemoAmount = 1000.0;
  const updated = db.updateUser(req.user.id, {
    demoBalance: defaultDemoAmount,
    demoInvested: 0,
  });

  db.logAudit({
    userId: req.user.id,
    userEmail: req.user.email,
    action: 'DEMO_BALANCE_RESET',
    details: 'User reset simulated demo investment balance to GH₵1,000.',
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    severity: 'info',
  });

  res.json({
    message: 'Demo balance reset to GH₵1,000.00.',
    demoBalance: updated?.demoBalance,
  });
});

export default router;

import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest, sanitizeUser } from '../auth.js';

const router = Router();

// Enforce admin on all routes in this router
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/overview
router.get('/overview', (req: AuthRequest, res: Response) => {
  const users = db.getUsers();
  const transactions = db.getTransactions();
  const auditLogs = db.getAuditLogs();

  const realDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'successful');
  const realWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'successful');
  const pendingWithdrawals = transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');
  const pendingDeposits = transactions.filter((t) => t.type === 'deposit' && t.status === 'pending');

  const totalRealDepositsAmount = realDeposits.reduce((acc, t) => acc + t.amount, 0);
  const totalRealWithdrawalsAmount = realWithdrawals.reduce((acc, t) => acc + t.amount, 0);
  const totalPendingWithdrawalAmount = pendingWithdrawals.reduce((acc, t) => acc + t.amount, 0);

  // Fraud detection alerts:
  // Detect users with high pending withdrawals or unverified accounts requesting large amounts
  const alerts: Array<{
    id: string;
    level: 'high' | 'medium' | 'info';
    message: string;
    userId?: string;
    userEmail?: string;
    timestamp: string;
  }> = [];

  pendingWithdrawals.forEach((pw) => {
    const user = users.find((u) => u.id === pw.userId);
    if (user && user.kycStatus === 'unverified') {
      alerts.push({
        id: `alert_${pw.id}`,
        level: 'high',
        message: `High risk: Withdrawal request of GH₵${pw.amount.toFixed(2)} from unverified user (${user.email}).`,
        userId: user.id,
        userEmail: user.email,
        timestamp: pw.createdAt,
      });
    }
    if (pw.amount > 5000) {
      alerts.push({
        id: `alert_amt_${pw.id}`,
        level: 'medium',
        message: `Large withdrawal request: GH₵${pw.amount.toFixed(2)} submitted by ${pw.userName}.`,
        userId: pw.userId,
        userEmail: pw.userEmail,
        timestamp: pw.createdAt,
      });
    }
  });

  res.json({
    metrics: {
      totalUsers: users.length,
      verifiedUsersCount: users.filter((u) => u.kycStatus === 'verified').length,
      totalRealDepositsAmount,
      totalRealWithdrawalsAmount,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalAmount: totalPendingWithdrawalAmount,
      pendingDepositsCount: pendingDeposits.length,
      totalTransactionsCount: transactions.length,
    },
    alerts,
    recentAuditLogs: auditLogs.slice(0, 20),
  });
});

// GET /api/admin/users
router.get('/users', (req: AuthRequest, res: Response) => {
  const users = db.getUsers().map((u) => sanitizeUser(u));
  res.json({ users });
});

// POST /api/admin/users/:id/kyc
router.post('/users/:id/kyc', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { kycStatus } = req.body;

  if (!['unverified', 'pending', 'verified'].includes(kycStatus)) {
    res.status(400).json({ error: 'Invalid KYC status.' });
    return;
  }

  const user = db.getUserById(id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const updated = db.updateUser(id, { kycStatus });

  db.logAudit({
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: 'ADMIN_KYC_UPDATED',
    details: `Admin changed KYC status of ${user.email} to ${kycStatus}.`,
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    severity: 'info',
  });

  res.json({ message: 'KYC status updated.', user: sanitizeUser(updated!) });
});

// POST /api/admin/users/:id/freeze
router.post('/users/:id/freeze', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isFrozen } = req.body;

  const user = db.getUserById(id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const updated = db.updateUser(id, { isFrozen: Boolean(isFrozen) });

  db.logAudit({
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: 'ADMIN_ACCOUNT_FREEZE_TOGGLE',
    details: `Admin set frozen state of ${user.email} to ${Boolean(isFrozen)}.`,
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    severity: 'warning',
  });

  res.json({ message: `Account freeze state changed.`, user: sanitizeUser(updated!) });
});

// POST /api/admin/users/:id/adjust-balance
router.post('/users/:id/adjust-balance', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { realBalance, demoBalance, reason } = req.body;

  const user = db.getUserById(id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const updates: any = {};
  if (typeof realBalance === 'number') updates.realBalance = Math.max(0, realBalance);
  if (typeof demoBalance === 'number') updates.demoBalance = Math.max(0, demoBalance);

  const updated = db.updateUser(id, updates);

  db.logAudit({
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: 'ADMIN_BALANCE_ADJUST',
    details: `Balance adjusted for ${user.email}. Reason: ${reason || 'N/A'}. Real: GH₵${updated?.realBalance}, Demo: GH₵${updated?.demoBalance}`,
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    severity: 'alert',
  });

  res.json({ message: 'Balances adjusted successfully.', user: sanitizeUser(updated!) });
});

// GET /api/admin/withdrawals
router.get('/withdrawals', (req: AuthRequest, res: Response) => {
  const allWithdrawals = db.getTransactions().filter((t) => t.type === 'withdrawal' && t.mode === 'real');
  res.json({ withdrawals: allWithdrawals });
});

// POST /api/admin/withdrawals/:id/review
router.post('/withdrawals/:id/review', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { decision, adminNotes } = req.body; // decision: 'approve' | 'reject'

  const tx = db.getTransactionById(id);
  if (!tx || tx.type !== 'withdrawal') {
    res.status(404).json({ error: 'Withdrawal transaction not found.' });
    return;
  }

  if (tx.status !== 'pending') {
    res.status(400).json({ error: `Withdrawal is already ${tx.status}.` });
    return;
  }

  const user = db.getUserById(tx.userId);

  if (decision === 'approve') {
    // Approved! Add to totalWithdrawn for user
    if (user) {
      db.updateUser(user.id, {
        totalWithdrawn: user.totalWithdrawn + tx.amount,
      });
    }

    const updatedTx = db.updateTransaction(tx.id, {
      status: 'successful',
      notes: `Approved by admin (${req.user?.fullName}): ${adminNotes || 'Payout processed via Ghana MoMo settlement gateway'}`,
    });

    db.logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: 'WITHDRAWAL_APPROVED',
      details: `Approved withdrawal of GH₵${tx.amount.toFixed(2)} for ${tx.userName} (${tx.paymentReference}).`,
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      severity: 'info',
    });

    res.json({ message: 'Withdrawal approved successfully.', transaction: updatedTx });
  } else if (decision === 'reject') {
    // Rejected! Restore funds to user's real balance
    if (user) {
      db.updateUser(user.id, {
        realBalance: user.realBalance + tx.amount,
      });
    }

    const updatedTx = db.updateTransaction(tx.id, {
      status: 'rejected',
      notes: `Rejected by admin (${req.user?.fullName}): ${adminNotes || 'Verification or risk criteria not satisfied. Funds returned to balance.'}`,
    });

    db.logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: 'WITHDRAWAL_REJECTED',
      details: `Rejected withdrawal of GH₵${tx.amount.toFixed(2)} for ${tx.userName}. Funds refunded to balance.`,
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      severity: 'warning',
    });

    res.json({ message: 'Withdrawal rejected and funds refunded to user balance.', transaction: updatedTx });
  } else {
    res.status(400).json({ error: 'Invalid decision. Use "approve" or "reject".' });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (req: AuthRequest, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ logs });
});

export default router;

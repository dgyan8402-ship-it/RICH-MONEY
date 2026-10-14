export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  ghanaCardNumber?: string;
  kycStatus: 'unverified' | 'pending' | 'verified';
  isFrozen: boolean;
  realBalance: number;
  demoBalance: number;
  demoInvested: number;
  totalDeposited: number;
  totalWithdrawn: number;
  createdAt: string;
  securityQuestion?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'demo_investment' | 'demo_withdrawal' | 'demo_growth';
  mode: 'real' | 'demo';
  amount: number;
  currency: 'GHS';
  paymentMethod: 'mtn_momo' | 'telecel_cash' | 'at_money' | 'card' | 'bank_transfer' | 'demo_wallet';
  paymentReference: string;
  status: 'pending' | 'successful' | 'failed' | 'rejected';
  channelDetails?: {
    phone?: string;
    network?: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletSummary {
  currency: 'GHS';
  currencySymbol: 'GH₵';
  threshold: number;
  real: {
    balance: number;
    withdrawable: number;
    totalDeposited: number;
    totalWithdrawn: number;
    isThresholdReached: boolean;
    kycStatus: string;
  };
  demo: {
    balance: number;
    invested: number;
    isThresholdReached: boolean;
    thresholdNotice: string;
  };
}

export interface DailyProjection {
  day: number;
  dateStr: string;
  startingBalance: number;
  dailyGain: number;
  endingBalance: number;
}

export interface CalculationResult {
  startingAmount: number;
  days: number;
  dailyRate: number;
  dailyRatePercentage: string;
  formula: string;
  finalProjected: number;
  totalHypotheticalProfit: number;
  projections: DailyProjection[];
  disclaimer: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  details: string;
  ip: string;
  severity: 'info' | 'warning' | 'alert';
  createdAt: string;
}

export interface AdminOverview {
  metrics: {
    totalUsers: number;
    verifiedUsersCount: number;
    totalRealDepositsAmount: number;
    totalRealWithdrawalsAmount: number;
    pendingWithdrawalsCount: number;
    pendingWithdrawalAmount: number;
    pendingDepositsCount: number;
    totalTransactionsCount: number;
  };
  alerts: Array<{
    id: string;
    level: 'high' | 'medium' | 'info';
    message: string;
    userId?: string;
    userEmail?: string;
    timestamp: string;
  }>;
  recentAuditLogs: AuditLog[];
}

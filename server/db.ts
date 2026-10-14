import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'user' | 'admin';
  ghanaCardNumber?: string;
  kycStatus: 'unverified' | 'pending' | 'verified';
  isFrozen: boolean;
  realBalance: number;       // Legitimate withdrawable funds (GHS)
  demoBalance: number;       // Isolated simulated investment funds (GHS)
  demoInvested: number;      // Amount committed in demo mode (GHS)
  totalDeposited: number;    // Cumulative real deposits verified (GHS)
  totalWithdrawn: number;    // Cumulative real withdrawals approved (GHS)
  createdAt: string;
  securityQuestion?: string;
  securityAnswerHash?: string;
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

export interface SimulationHistory {
  id: string;
  userId: string;
  startingAmount: number;
  days: number;
  dailyRate: number; // default 0.30
  projectedEnding: number;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  simulations: SimulationHistory[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema = {
    users: [],
    transactions: [],
    auditLogs: [],
    simulations: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.error('[DB] Error initializing database, loading defaults:', err);
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('AdminPass123!', salt);
    const userPasswordHash = bcrypt.hashSync('Password123!', salt);
    const securityAnswerHash = bcrypt.hashSync('accra', salt);

    const adminUser: User = {
      id: 'usr_admin_001',
      fullName: 'Kwame Osei (Administrator)',
      email: 'admin@richmoney.gh',
      phone: '+233 24 000 0001',
      passwordHash: adminPasswordHash,
      role: 'admin',
      ghanaCardNumber: 'GHA-700100200-1',
      kycStatus: 'verified',
      isFrozen: false,
      realBalance: 50000.0,
      demoBalance: 5000.0,
      demoInvested: 2000.0,
      totalDeposited: 60000.0,
      totalWithdrawn: 10000.0,
      createdAt: '2026-01-15T09:00:00.000Z',
      securityQuestion: 'In which city were you born?',
      securityAnswerHash,
    };

    const demoUser: User = {
      id: 'usr_kofi_002',
      fullName: 'Kofi Mensah',
      email: 'kofi.mensah@example.com',
      phone: '+233 24 412 3456',
      passwordHash: userPasswordHash,
      role: 'user',
      ghanaCardNumber: 'GHA-823456789-3',
      kycStatus: 'verified',
      isFrozen: false,
      realBalance: 350.0,
      demoBalance: 850.0,
      demoInvested: 500.0,
      totalDeposited: 500.0,
      totalWithdrawn: 150.0,
      createdAt: '2026-02-10T11:30:00.000Z',
      securityQuestion: 'In which city were you born?',
      securityAnswerHash,
    };

    const initialTransactions: Transaction[] = [
      {
        id: 'tx_dep_101',
        userId: 'usr_kofi_002',
        userEmail: 'kofi.mensah@example.com',
        userName: 'Kofi Mensah',
        type: 'deposit',
        mode: 'real',
        amount: 500.0,
        currency: 'GHS',
        paymentMethod: 'mtn_momo',
        paymentReference: 'MOM-GH-894218',
        status: 'successful',
        channelDetails: {
          phone: '+233 24 412 3456',
          network: 'MTN Mobile Money',
        },
        notes: 'Verified sandbox deposit via MTN MoMo Gateway',
        createdAt: '2026-03-01T14:22:00.000Z',
        updatedAt: '2026-03-01T14:23:10.000Z',
      },
      {
        id: 'tx_wd_102',
        userId: 'usr_kofi_002',
        userEmail: 'kofi.mensah@example.com',
        userName: 'Kofi Mensah',
        type: 'withdrawal',
        mode: 'real',
        amount: 150.0,
        currency: 'GHS',
        paymentMethod: 'mtn_momo',
        paymentReference: 'WDL-GH-339182',
        status: 'successful',
        channelDetails: {
          phone: '+233 24 412 3456',
          accountName: 'Kofi Mensah',
          network: 'MTN Mobile Money',
        },
        notes: 'Legitimate withdrawal processed to verified MoMo wallet',
        createdAt: '2026-03-15T10:05:00.000Z',
        updatedAt: '2026-03-15T11:00:00.000Z',
      },
      {
        id: 'tx_demo_103',
        userId: 'usr_kofi_002',
        userEmail: 'kofi.mensah@example.com',
        userName: 'Kofi Mensah',
        type: 'demo_investment',
        mode: 'demo',
        amount: 500.0,
        currency: 'GHS',
        paymentMethod: 'demo_wallet',
        paymentReference: 'SIM-INV-55102',
        status: 'successful',
        notes: 'Simulated starting test capital for 30% daily growth simulator',
        createdAt: '2026-03-20T08:00:00.000Z',
        updatedAt: '2026-03-20T08:00:00.000Z',
      },
      {
        id: 'tx_demo_104',
        userId: 'usr_kofi_002',
        userEmail: 'kofi.mensah@example.com',
        userName: 'Kofi Mensah',
        type: 'demo_growth',
        mode: 'demo',
        amount: 350.0,
        currency: 'GHS',
        paymentMethod: 'demo_wallet',
        paymentReference: 'SIM-GRW-99120',
        status: 'successful',
        notes: 'Simulated hypothetical daily compound growth (non-withdrawable demo profit)',
        createdAt: '2026-03-22T08:00:00.000Z',
        updatedAt: '2026-03-22T08:00:00.000Z',
      },
    ];

    const initialAudit: AuditLog[] = [
      {
        id: 'aud_001',
        userId: 'usr_admin_001',
        userEmail: 'admin@richmoney.gh',
        action: 'SYSTEM_BOOTSTRAP',
        details: 'Rich Money Ghana investment platform initialized with dual demo/real ledger separation.',
        ip: '127.0.0.1',
        severity: 'info',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'aud_002',
        userId: 'usr_kofi_002',
        userEmail: 'kofi.mensah@example.com',
        action: 'KYC_AUTO_VERIFIED',
        details: 'Ghana Card biometric validation simulated successfully for Kofi Mensah.',
        ip: '197.254.16.8',
        severity: 'info',
        createdAt: '2026-02-10T11:32:00.000Z',
      },
    ];

    this.data = {
      users: [adminUser, demoUser],
      transactions: initialTransactions,
      auditLogs: initialAudit,
      simulations: [],
    };
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to persist data to disk:', err);
    }
  }

  // --- User Operations ---
  public getUsers(): User[] {
    return [...this.data.users];
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // --- Transactions ---
  public getTransactions(filter?: { userId?: string; mode?: 'real' | 'demo' }): Transaction[] {
    let list = [...this.data.transactions];
    if (filter?.userId) {
      list = list.filter((t) => t.userId === filter.userId);
    }
    if (filter?.mode) {
      list = list.filter((t) => t.mode === filter.mode);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.data.transactions.find((t) => t.id === id);
  }

  public createTransaction(tx: Transaction): Transaction {
    this.data.transactions.unshift(tx);
    this.persist();
    return tx;
  }

  public updateTransaction(id: string, updates: Partial<Transaction>): Transaction | undefined {
    const idx = this.data.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.data.transactions[idx] = {
      ...this.data.transactions[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.transactions[idx];
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...log,
    };
    this.data.auditLogs.unshift(newLog);
    // keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.persist();
    return newLog;
  }

  // --- Simulation Records ---
  public getSimulations(userId: string): SimulationHistory[] {
    return this.data.simulations
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public saveSimulation(record: Omit<SimulationHistory, 'id' | 'createdAt'>): SimulationHistory {
    const newSim: SimulationHistory = {
      id: `sim_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...record,
    };
    this.data.simulations.unshift(newSim);
    this.persist();
    return newSim;
  }
}

export const db = new Database();

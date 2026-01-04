import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // ISO string
  description: string;
}

export interface Goal {
  id: string;
  targetAmount: number;
  currentAmount: number;
  description: string;
  deadline?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  mainGoal: string;
}

export interface UserStats {
  streakDays: number;
  level: number;
  points: number;
  lastActivityDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private authService = inject(AuthService);

  // State
  readonly transactions = signal<Transaction[]>([]);
  readonly goals = signal<Goal[]>([]);
  readonly messages = signal<Message[]>([]);
  readonly userProfile = signal<UserProfile>({ name: '', monthlyIncome: 0, mainGoal: '' });
  readonly stats = signal<UserStats>({ streakDays: 0, level: 1, points: 0, lastActivityDate: null });
  readonly onboardingComplete = signal<boolean>(false);
  readonly darkMode = signal<boolean>(false);

  // Computed
  readonly balance = computed(() => {
    return this.transactions().reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  });

  readonly totalIncome = computed(() => {
    return this.transactions()
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  });

  readonly totalExpense = computed(() => {
    return this.transactions()
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  });

  readonly expensesByCategory = computed(() => {
    const expenses = this.transactions().filter(t => t.type === 'expense');
    const grouped: Record<string, number> = {};
    expenses.forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  });

  readonly savingsRate = computed(() => {
    const inc = this.userProfile().monthlyIncome || this.totalIncome();
    if (inc === 0) return 0;
    const saved = inc - this.totalExpense();
    return Math.max(0, (saved / inc) * 100);
  });

  constructor() {
    // Load data when user changes
    effect(() => {
      if (this.authService.user()) {
        this.loadData();
      } else {
        this.resetState();
      }
    });

    // Theme persistence remains local
    const theme = localStorage.getItem('finchat_theme');
    if (theme) {
      this.darkMode.set(JSON.parse(theme));
      this.applyTheme(this.darkMode());
    }
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  async loadData() {
    const user = this.authService.user();
    if (!user) return;

    // Load Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      this.userProfile.set({
        name: profile.name,
        monthlyIncome: profile.monthly_income,
        mainGoal: profile.main_goal
      });
      this.onboardingComplete.set(true); // If profile exists, onboarding is done
    } else {
      // Init profile if new
      this.onboardingComplete.set(false);
    }

    // Load Transactions
    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (txs) {
      this.transactions.set(txs.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date,
        description: t.description
      })));
    }

    // Load Goals
    const { data: goals } = await supabase
      .from('goals')
      .select('*');

    if (goals) {
      this.goals.set(goals.map(g => ({
        id: g.id,
        targetAmount: g.target_amount,
        currentAmount: g.current_amount,
        description: g.description,
        deadline: g.deadline
      })));
    }

    // Stats are currently local-only for demo (could be moved to DB)
    const st = localStorage.getItem('finchat_stats');
    if (st) this.stats.set(JSON.parse(st));

    // Initial welcome message if needed
    if (this.messages().length === 0 && !this.onboardingComplete()) {
      this.messages.set([{
        id: 'welcome',
        role: 'bot',
        content: 'Olá! Sou o MiloAI. Vou te ajudar a organizar suas finanças. Para começarmos, como gostaria de ser chamado?',
        timestamp: new Date()
      }]);
    }
  }

  private resetState() {
    this.transactions.set([]);
    this.goals.set([]);
    this.userProfile.set({ name: '', monthlyIncome: 0, mainGoal: '' });
    this.onboardingComplete.set(false);
  }

  async addTransaction(tx: Omit<Transaction, 'id'>) {
    const user = this.authService.user();
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        date: tx.date,
        description: tx.description
      })
      .select()
      .single();

    if (data && !error) {
      const newTx: Transaction = {
        id: data.id,
        type: data.type,
        amount: data.amount,
        category: data.category,
        date: data.date,
        description: data.description
      };
      this.transactions.update(prev => [newTx, ...prev]);
      this.updateGamification();
    }
  }

  deleteTransaction(id: string) {
    supabase.from('transactions').delete().eq('id', id).then(({ error }) => {
      if (!error) {
        this.transactions.update(prev => prev.filter(t => t.id !== id));
      }
    });
  }

  async addGoal(goal: Omit<Goal, 'id' | 'currentAmount'>) {
    const user = this.authService.user();
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        target_amount: goal.targetAmount,
        current_amount: 0,
        description: goal.description,
        deadline: goal.deadline
      })
      .select()
      .single();

    if (data && !error) {
      const newGoal: Goal = {
        id: data.id,
        targetAmount: data.target_amount,
        currentAmount: data.current_amount,
        description: data.description,
        deadline: data.deadline
      };
      this.goals.update(prev => [...prev, newGoal]);
    }
  }

  addMessage(msg: Omit<Message, 'id' | 'timestamp'>) {
    // Messages are local only for now (ephemeral chat)
    this.messages.update(prev => [
      ...prev,
      { ...msg, id: crypto.randomUUID(), timestamp: new Date() }
    ]);
  }

  async updateProfile(partial: Partial<UserProfile>) {
    const user = this.authService.user();
    if (!user) return;

    // Optimistic update
    this.userProfile.update(prev => ({ ...prev, ...partial }));

    const current = this.userProfile();

    // Upsert profile
    await supabase.from('profiles').upsert({
      id: user.id,
      name: current.name,
      monthly_income: current.monthlyIncome,
      main_goal: current.mainGoal,
      updated_at: new Date().toISOString()
    });
  }

  completeOnboarding() {
    this.onboardingComplete.set(true);
  }

  toggleTheme() {
    this.darkMode.update(v => {
      const newVal = !v;
      localStorage.setItem('finchat_theme', JSON.stringify(newVal));
      this.applyTheme(newVal);
      return newVal;
    });
  }

  private updateGamification() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const stats = this.stats();

    let newStreak = stats.streakDays;
    let newLevel = stats.level;
    let newPoints = stats.points + 10; // 10 points per transaction

    if (stats.lastActivityDate !== today) {
      newStreak = stats.streakDays + 1;
    }

    if (newPoints > newLevel * 100) {
      newLevel++;
    }

    const newStats = {
      streakDays: newStreak,
      level: newLevel,
      points: newPoints,
      lastActivityDate: today
    };

    this.stats.set(newStats);
    localStorage.setItem('finchat_stats', JSON.stringify(newStats));
  }

  getContextData() {
    return {
      userProfile: this.userProfile(),
      balance: this.balance(),
      recentTransactions: this.transactions().slice(0, 5),
      expensesByCategory: this.expensesByCategory(),
      goals: this.goals(),
      onboardingComplete: this.onboardingComplete(),
      stats: this.stats()
    };
  }
}
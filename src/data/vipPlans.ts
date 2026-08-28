export interface VipPlan {
  id: string;
  name: string;
  badge: 'Starter' | 'Popular' | 'Premium' | 'VIP';
  dailyIncomePercent: number;
  minInvestment: number;
  dailyEarnings: number;
  durationDays: number;
  totalReturn: number;
  color: string;
  gradient: string;
  description: string;
}

export const VIP_PLANS: VipPlan[] = [
  {
    id: 'interns',
    name: 'Interns',
    badge: 'Starter',
    dailyIncomePercent: 6,
    minInvestment: 10,
    dailyEarnings: 0.60,
    durationDays: 70,
    totalReturn: 42.00,
    color: 'emerald',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-slate-900',
    description: 'Entry-level staking plan ideal for beginners starting with micro capital.'
  },
  {
    id: 'foundation',
    name: 'Foundation',
    badge: 'Popular',
    dailyIncomePercent: 6,
    minInvestment: 20,
    dailyEarnings: 1.20,
    durationDays: 69,
    totalReturn: 82.80,
    color: 'sky',
    gradient: 'from-sky-500/20 via-blue-500/10 to-slate-900',
    description: 'Balanced starter tier offering reliable daily yields over a 69-day term.'
  },
  {
    id: 'bronze',
    name: 'Bronze',
    badge: 'Premium',
    dailyIncomePercent: 7,
    minInvestment: 100,
    dailyEarnings: 6.50,
    durationDays: 75,
    totalReturn: 487.50,
    color: 'amber',
    gradient: 'from-amber-500/20 via-orange-500/10 to-slate-900',
    description: 'High-growth tier for active investors seeking steady compound gains.'
  },
  {
    id: 'silver',
    name: 'Silver',
    badge: 'VIP',
    dailyIncomePercent: 7,
    minInvestment: 400,
    dailyEarnings: 26.00,
    durationDays: 78,
    totalReturn: 2028.00,
    color: 'indigo',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-slate-900',
    description: 'VIP allocation for dedicated capital pools with maximum stability.'
  },
  {
    id: 'gold',
    name: 'Gold',
    badge: 'Starter',
    dailyIncomePercent: 10,
    minInvestment: 1600,
    dailyEarnings: 160.00,
    durationDays: 50,
    totalReturn: 8000.00,
    color: 'yellow',
    gradient: 'from-yellow-500/20 via-amber-500/10 to-slate-900',
    description: 'Accelerated yield contract producing $160.00 daily passive revenue.'
  },
  {
    id: 'platinum',
    name: 'Platnum',
    badge: 'Starter',
    dailyIncomePercent: 12,
    minInvestment: 10000,
    dailyEarnings: 1200.00,
    durationDays: 40,
    totalReturn: 48000.00,
    color: 'purple',
    gradient: 'from-purple-500/20 via-fuchsia-500/10 to-slate-900',
    description: 'Institutional-grade high yield producing $1,200 daily over 40 days.'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    badge: 'Starter',
    dailyIncomePercent: 19,
    minInvestment: 25000,
    dailyEarnings: 4750.00,
    durationDays: 80,
    totalReturn: 380000.00,
    color: 'cyan',
    gradient: 'from-cyan-500/20 via-emerald-500/10 to-slate-900',
    description: 'Ultra VIP tier with exceptional daily returns of $4,750 for elite capital.'
  }
];

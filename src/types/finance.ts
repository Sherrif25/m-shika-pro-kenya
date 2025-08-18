export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  payment_method: "M-Pesa" | "Cash" | "Bank" | "Card";
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface IncomeStream {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: "weekly" | "bi-weekly" | "monthly" | "quarterly" | "yearly" | "one-time";
  nextDate: string;
  isActive: boolean;
  user_id?: string;
}

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport", 
  "Rent",
  "Utilities",
  "Airtime",
  "Entertainment",
  "Healthcare",
  "Education",
  "Shopping",
  "Other"
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Rental",
  "Commission",
  "Bonus",
  "Side Hustle",
  "Gift",
  "Other"
] as const;

export const TRANSACTION_CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES
] as const;

export interface BudgetTarget {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  period: "weekly" | "monthly";
  user_id?: string;
}

export const PAYMENT_METHODS = [
  "M-Pesa",
  "Cash", 
  "Bank",
  "Card"
] as const;
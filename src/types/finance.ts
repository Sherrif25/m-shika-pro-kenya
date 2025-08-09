export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: "M-Pesa" | "Cash" | "Bank" | "Card";
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

export const TRANSACTION_CATEGORIES = [
  "Food",
  "Transport", 
  "Rent",
  "Utilities",
  "Airtime",
  "Entertainment",
  "Healthcare",
  "Education",
  "Shopping",
  "Income",
  "Other"
] as const;

export const PAYMENT_METHODS = [
  "M-Pesa",
  "Cash", 
  "Bank",
  "Card"
] as const;
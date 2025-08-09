import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Wallet, Plus, MessageSquare } from "lucide-react";
import AddTransactionForm from "./AddTransactionForm";
import SmsParserForm from "./SmsParserForm";
import TransactionList from "./TransactionList";
import { Transaction, SavingsGoal } from "@/types/finance";

// Mock data for demo
const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: -120,
    category: "Food",
    description: "Lunch at Java House",
    date: new Date().toISOString(),
    paymentMethod: "M-Pesa"
  },
  {
    id: "2", 
    amount: 5000,
    category: "Income",
    description: "Salary payment",
    date: new Date(Date.now() - 86400000).toISOString(),
    paymentMethod: "Bank"
  },
  {
    id: "3",
    amount: -800,
    category: "Transport",
    description: "Matatu fare",
    date: new Date(Date.now() - 172800000).toISOString(),
    paymentMethod: "Cash"
  }
];

const mockSavingsGoals: SavingsGoal[] = [
  {
    id: "1",
    title: "Emergency Fund",
    targetAmount: 50000,
    currentAmount: 32000,
    deadline: "2024-12-31"
  },
  {
    id: "2",
    title: "New Phone",
    targetAmount: 25000,
    currentAmount: 8500,
    deadline: "2024-06-30"
  }
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [savingsGoals] = useState<SavingsGoal[]>(mockSavingsGoals);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSmsParser, setShowSmsParser] = useState(false);

  // Calculate financial summary
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const netBalance = totalIncome - totalExpenses;
  const financialHealthScore = Math.min(Math.max((netBalance / totalIncome) * 100, 0), 100);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions([newTransaction, ...transactions]);
    setShowAddForm(false);
  };

  const addParsedTransaction = (transaction: Omit<Transaction, "id">) => {
    addTransaction(transaction);
    setShowSmsParser(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/10 to-secondary-light/10 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">M-Shika Pro</h1>
          <p className="text-muted-foreground">Your smart finance companion</p>
        </div>

        {/* Financial Health Score */}
        <Card className="bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Financial Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold">{Math.round(financialHealthScore)}%</div>
              <Progress value={financialHealthScore} className="h-3 bg-white/20" />
              <p className="text-sm text-white/90">
                {financialHealthScore >= 70 ? "Excellent! Keep it up!" : 
                 financialHealthScore >= 50 ? "Good progress, small improvements needed" :
                 "Time to review your spending habits"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-success">KSh {totalIncome.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-destructive">KSh {totalExpenses.toLocaleString()}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Balance</p>
                  <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                    KSh {netBalance.toLocaleString()}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setShowAddForm(true)}
            className="flex-1 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
          <Button 
            onClick={() => setShowSmsParser(true)}
            variant="secondary"
            className="flex-1 bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-light hover:to-secondary"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Parse M-Pesa SMS
          </Button>
        </div>

        {/* Savings Goals */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Track your progress towards financial milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsGoals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        KSh {goal.currentAmount.toLocaleString()} / KSh {goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(progress)}% complete • Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <TransactionList transactions={transactions.slice(0, 5)} />

        {/* Forms */}
        {showAddForm && (
          <AddTransactionForm 
            onSubmit={addTransaction}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {showSmsParser && (
          <SmsParserForm
            onSubmit={addParsedTransaction}
            onCancel={() => setShowSmsParser(false)}
          />
        )}
      </div>
    </div>
  );
}
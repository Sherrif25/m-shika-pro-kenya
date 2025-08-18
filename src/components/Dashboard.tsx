import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Target, Wallet, Plus, MessageSquare, BarChart3, Lightbulb, Goal, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import AddTransactionForm from "./AddTransactionForm";
import SmsParserForm from "./SmsParserForm";
import TransactionList from "./TransactionList";
import FinancialCharts from "./FinancialCharts";
import FinancialInsights from "./FinancialInsights";
import GoalTracker from "./GoalTracker";
import BudgetTracker from "./BudgetTracker";
import IncomeTracker from "./IncomeTracker";
import { Transaction, SavingsGoal } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";

// Mock data for demo
const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: -120,
    category: "Food",
    description: "Lunch at Java House",
    date: new Date().toISOString(),
    payment_method: "M-Pesa"
  },
  {
    id: "2", 
    amount: 5000,
    category: "Income",
    description: "Salary payment",
    date: new Date(Date.now() - 86400000).toISOString(),
    payment_method: "Bank"
  },
  {
    id: "3",
    amount: -800,
    category: "Transport",
    description: "Matatu fare",
    date: new Date(Date.now() - 172800000).toISOString(),
    payment_method: "Cash"
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
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const {
    transactions,
    savingsGoals,
    budgetTargets,
    incomeStreams,
    loading,
    addTransaction: addUserTransaction,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addBudgetTarget,
    updateBudgetTarget,
    deleteBudgetTarget,
    addIncomeStream,
    updateIncomeStream,
    deleteIncomeStream
  } = useUserData();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showSmsParser, setShowSmsParser] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate financial summary (separated income and expenses for discipline focus)
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      await addUserTransaction(transaction);
      setShowAddForm(false);
      toast({
        title: "Transaction added",
        description: "Your transaction has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addParsedTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      await addTransaction(transaction);
      setShowSmsParser(false);
    } catch (error) {
      // Error already handled in addTransaction
    }
  };

  const addGoal = async (goal: Omit<SavingsGoal, "id">) => {
    try {
      await addSavingsGoal(goal);
      toast({
        title: "Goal created",
        description: "Your savings goal has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateGoal = async (goalId: string, amount: number) => {
    try {
      const goal = savingsGoals.find(g => g.id === goalId);
      if (goal) {
        await updateSavingsGoal(goalId, goal.currentAmount + amount);
        toast({
          title: "Goal updated",
          description: `Added KSh ${amount.toLocaleString()} to your goal.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await deleteSavingsGoal(goalId);
      toast({
        title: "Goal deleted",
        description: "Your savings goal has been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addBudget = async (budget: any) => {
    try {
      await addBudgetTarget(budget);
      toast({
        title: "Budget created",
        description: "Your budget target has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateBudget = async (budgetId: string, monthlyLimit: number) => {
    try {
      await updateBudgetTarget(budgetId, monthlyLimit);
      toast({
        title: "Budget updated",
        description: "Your budget limit has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteBudget = async (budgetId: string) => {
    try {
      await deleteBudgetTarget(budgetId);
      toast({
        title: "Budget deleted",
        description: "Your budget target has been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addIncome = async (income: any) => {
    try {
      await addIncomeStream(income);
      toast({
        title: "Income stream added",
        description: "Your income source has been configured successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add income stream. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateIncome = async (incomeId: string, updates: any) => {
    try {
      await updateIncomeStream(incomeId, updates);
      toast({
        title: "Income stream updated",
        description: "Your income source has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update income stream. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteIncome = async (incomeId: string) => {
    try {
      await deleteIncomeStream(incomeId);
      toast({
        title: "Income stream deleted",
        description: "Your income source has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete income stream. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light/10 to-secondary-light/10">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/10 to-secondary-light/10 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-center space-y-2 flex-1">
            <h1 className="text-3xl font-bold text-primary">M-Shika Pro</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6 mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Income</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Goal className="h-4 w-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Financial Discipline Score */}
            <Card className="bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Financial Discipline Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold">{Math.max(Math.round(savingsRate), 0)}%</div>
                  <Progress value={Math.max(savingsRate, 0)} className="h-3 bg-white/20" />
                  <p className="text-sm text-white/90">
                    {savingsRate >= 20 ? "Excellent savings discipline!" : 
                     savingsRate >= 10 ? "Good progress, keep building habits" :
                     savingsRate >= 0 ? "Focus on reducing expenses" :
                     "Expenses exceed income - time for urgent changes"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Budget Overview */}
            {budgetTargets.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                  <CardDescription>This month's spending vs targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {budgetTargets.slice(0, 3).map((budget) => {
                      const getCurrentMonthSpending = (category: string) => {
                        const now = new Date();
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        return transactions
                          .filter(t => 
                            t.category === category && 
                            t.amount < 0 && 
                            new Date(t.date) >= startOfMonth
                          )
                          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                      };
                      
                      const currentSpent = getCurrentMonthSpending(budget.category);
                      const progress = (currentSpent / budget.monthlyLimit) * 100;
                      
                      return (
                        <div key={budget.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{budget.category}</h4>
                            <span className="text-sm text-muted-foreground">
                              KSh {currentSpent.toLocaleString()} / KSh {budget.monthlyLimit.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                          <p className={`text-xs ${progress >= 100 ? 'text-destructive' : progress >= 80 ? 'text-warning' : 'text-muted-foreground'}`}>
                            {Math.round(progress)}% used • KSh {(budget.monthlyLimit - currentSpent).toLocaleString()} {currentSpent > budget.monthlyLimit ? 'over budget' : 'remaining'}
                          </p>
                        </div>
                      );
                    })}
                    {budgetTargets.length > 3 && (
                      <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab("budgets")}
                        className="w-full mt-2"
                      >
                        View All Budgets ({budgetTargets.length})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Savings Goals Summary */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Savings Goals Summary</CardTitle>
                <CardDescription>Quick overview of your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savingsGoals.slice(0, 3).map((goal) => {
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
                  {savingsGoals.length > 3 && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveTab("goals")}
                      className="w-full mt-2"
                    >
                      View All Goals ({savingsGoals.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <TransactionList transactions={transactions.slice(0, 8)} />
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-6">
            <IncomeTracker 
              incomeStreams={incomeStreams}
              transactions={transactions}
              onAddIncome={addIncome}
              onUpdateIncome={updateIncome}
              onDeleteIncome={deleteIncome}
            />
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budgets" className="space-y-6">
            <BudgetTracker 
              budgets={budgetTargets}
              transactions={transactions}
              onAddBudget={addBudget}
              onUpdateBudget={updateBudget}
              onDeleteBudget={deleteBudget}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <FinancialCharts transactions={transactions} />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <GoalTracker 
              goals={savingsGoals}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
            />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <FinancialInsights transactions={transactions} />
          </TabsContent>
        </Tabs>

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
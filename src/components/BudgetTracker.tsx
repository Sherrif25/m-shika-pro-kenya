import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, TrendingDown, Plus, Edit, Trash2, Target } from "lucide-react";
import { BudgetTarget, Transaction, EXPENSE_CATEGORIES } from "@/types/finance";

interface BudgetTrackerProps {
  budgets: BudgetTarget[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<BudgetTarget, "id" | "currentSpent">) => void;
  onUpdateBudget: (budgetId: string, monthlyLimit: number) => void;
  onDeleteBudget: (budgetId: string) => void;
}

const BUDGET_TEMPLATES = [
  { category: "Food", amount: 8000 },
  { category: "Transport", amount: 4000 },
  { category: "Entertainment", amount: 3000 },
  { category: "Utilities", amount: 2500 },
  { category: "Airtime", amount: 1500 },
  { category: "Healthcare", amount: 2000 },
  { category: "Shopping", amount: 5000 },
];

export default function BudgetTracker({ budgets, transactions, onAddBudget, onUpdateBudget, onDeleteBudget }: BudgetTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState({
    category: "",
    monthlyLimit: "",
    period: "monthly" as const,
    template: ""
  });
  const [editAmount, setEditAmount] = useState("");

  // Calculate current month's spending for each category
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

  // Get budget data with current spending
  const getBudgetData = () => {
    return budgets.map(budget => ({
      ...budget,
      currentSpent: getCurrentMonthSpending(budget.category),
      progress: (getCurrentMonthSpending(budget.category) / budget.monthlyLimit) * 100
    }));
  };

  const handleTemplateSelect = (template: string) => {
    const selectedTemplate = BUDGET_TEMPLATES.find(t => t.category === template);
    if (selectedTemplate) {
      setNewBudget({
        category: selectedTemplate.category,
        monthlyLimit: selectedTemplate.amount.toString(),
        period: "monthly",
        template
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.monthlyLimit) return;

    // Check if budget for this category already exists
    const existingBudget = budgets.find(b => b.category === newBudget.category);
    if (existingBudget) {
      // Update existing budget instead
      onUpdateBudget(existingBudget.id, parseFloat(newBudget.monthlyLimit));
    } else {
      onAddBudget({
        category: newBudget.category,
        monthlyLimit: parseFloat(newBudget.monthlyLimit),
        period: newBudget.period
      });
    }

    setNewBudget({ category: "", monthlyLimit: "", period: "monthly", template: "" });
    setShowAddForm(false);
  };

  const handleEditBudget = (budgetId: string) => {
    const amount = parseFloat(editAmount);
    if (amount > 0) {
      onUpdateBudget(budgetId, amount);
      setEditAmount("");
      setEditingBudget(null);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-destructive";
    if (progress >= 80) return "bg-warning";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-success";
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) return { variant: "destructive", text: "Over Budget", icon: AlertTriangle };
    if (progress >= 80) return { variant: "secondary", text: "Near Limit", icon: TrendingUp };
    return { variant: "default", text: "On Track", icon: TrendingDown };
  };

  const budgetData = getBudgetData();
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgetData.reduce((sum, b) => sum + b.currentSpent, 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Get available categories (expense categories only, not already budgeted)
  const availableCategories = EXPENSE_CATEGORIES.filter(
    cat => !budgets.some(b => b.category === cat)
  ) as string[];

  return (
    <div className="space-y-6">
      {/* Overall Budget Summary */}
      <Card className="shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Monthly Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Monthly Budget</p>
                <p className="text-2xl font-bold">KSh {totalBudget.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Spent This Month</p>
                <p className={`text-2xl font-bold ${overallProgress >= 100 ? 'text-destructive' : overallProgress >= 80 ? 'text-warning' : 'text-success'}`}>
                  KSh {totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
            <Progress value={Math.min(overallProgress, 100)} className="h-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {overallProgress.toFixed(1)}% of budget used
              </span>
              <span className="text-sm text-muted-foreground">
                KSh {(totalBudget - totalSpent).toLocaleString()} remaining
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Track spending limits for each category</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-primary to-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgetData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">🎯</div>
              <p className="mb-2">No budget targets set</p>
              <p className="text-sm">Create your first budget to control spending!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetData.map((budget) => {
                const status = getStatusBadge(budget.progress);
                const StatusIcon = status.icon;
                
                return (
                  <div key={budget.id} className="p-4 border rounded-lg bg-card hover:bg-accent/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{budget.category}</h3>
                        <Badge variant={status.variant as any} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.text}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBudget(editingBudget === budget.id ? null : budget.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteBudget(budget.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          KSh {budget.currentSpent.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of KSh {budget.monthlyLimit.toLocaleString()} limit
                        </span>
                      </div>
                      
                      <div className="relative">
                        <Progress value={Math.min(budget.progress, 100)} className="h-3" />
                        <div 
                          className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(budget.progress)}`}
                          style={{ width: `${Math.min(budget.progress, 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {budget.progress.toFixed(1)}% used
                        </span>
                        <span className={`text-sm ${budget.monthlyLimit - budget.currentSpent >= 0 ? 'text-success' : 'text-destructive'}`}>
                          KSh {(budget.monthlyLimit - budget.currentSpent).toLocaleString()} {budget.monthlyLimit - budget.currentSpent >= 0 ? 'remaining' : 'over budget'}
                        </span>
                      </div>

                      {editingBudget === budget.id && (
                        <div className="flex gap-2 mt-3 p-3 bg-muted rounded-lg">
                          <Input
                            type="number"
                            placeholder="New budget limit"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => handleEditBudget(budget.id)}
                            disabled={!editAmount || parseFloat(editAmount) <= 0}
                            className="bg-gradient-to-r from-primary to-primary-dark"
                          >
                            Update
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Budget Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Budget Target</CardTitle>
              <CardDescription>Set spending limits for expense categories</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Quick Start Templates</Label>
                  <Select value={newBudget.template} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template or create custom" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_TEMPLATES.filter(t => availableCategories.includes(t.category)).map((template) => (
                        <SelectItem key={template.category} value={template.category}>
                          {template.category} - KSh {template.amount.toLocaleString()}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newBudget.category} onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit">Monthly Limit (KSh)</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={newBudget.monthlyLimit}
                    onChange={(e) => setNewBudget({ ...newBudget, monthlyLimit: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary-dark">
                    Create Budget
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
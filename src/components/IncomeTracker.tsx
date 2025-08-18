import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Plus, Edit, Trash2, Calendar, BarChart } from "lucide-react";
import { IncomeStream, Transaction, INCOME_CATEGORIES } from "@/types/finance";

interface IncomeTrackerProps {
  incomeStreams: IncomeStream[];
  transactions: Transaction[];
  onAddIncome: (income: Omit<IncomeStream, "id">) => void;
  onUpdateIncome: (incomeId: string, updates: Partial<IncomeStream>) => void;
  onDeleteIncome: (incomeId: string) => void;
}

const INCOME_TEMPLATES = [
  { category: "Salary", amount: 50000, frequency: "monthly" },
  { category: "Freelance", amount: 15000, frequency: "monthly" },
  { category: "Business", amount: 25000, frequency: "monthly" },
  { category: "Investment", amount: 5000, frequency: "monthly" },
  { category: "Side Hustle", amount: 8000, frequency: "weekly" },
  { category: "Rental", amount: 12000, frequency: "monthly" },
];

export default function IncomeTracker({ incomeStreams, transactions, onAddIncome, onUpdateIncome, onDeleteIncome }: IncomeTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<string | null>(null);
  const [newIncome, setNewIncome] = useState({
    category: "",
    description: "",
    amount: "",
    frequency: "monthly" as const,
    nextDate: "",
    template: ""
  });
  const [editAmount, setEditAmount] = useState("");

  // Calculate current month's income for each category
  const getCurrentMonthIncome = (category: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(t => 
        t.category === category && 
        t.amount > 0 && 
        new Date(t.date) >= startOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Get income data with current earnings
  const getIncomeData = () => {
    return incomeStreams.map(income => ({
      ...income,
      currentEarned: getCurrentMonthIncome(income.category),
      monthlyTarget: income.frequency === 'monthly' ? income.amount :
                    income.frequency === 'weekly' ? income.amount * 4 :
                    income.frequency === 'bi-weekly' ? income.amount * 2 :
                    income.frequency === 'quarterly' ? income.amount / 3 :
                    income.frequency === 'yearly' ? income.amount / 12 :
                    income.amount
    }));
  };

  const handleTemplateSelect = (template: string) => {
    const selectedTemplate = INCOME_TEMPLATES.find(t => t.category === template);
    if (selectedTemplate) {
      const nextDate = new Date();
      if (selectedTemplate.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      
      setNewIncome({
        category: selectedTemplate.category,
        description: `${selectedTemplate.category} income`,
        amount: selectedTemplate.amount.toString(),
        frequency: selectedTemplate.frequency as any,
        nextDate: nextDate.toISOString().split('T')[0],
        template
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncome.category || !newIncome.amount || !newIncome.nextDate) return;

    onAddIncome({
      category: newIncome.category,
      description: newIncome.description || `${newIncome.category} income`,
      amount: parseFloat(newIncome.amount),
      frequency: newIncome.frequency,
      nextDate: newIncome.nextDate,
      isActive: true
    });

    setNewIncome({ category: "", description: "", amount: "", frequency: "monthly", nextDate: "", template: "" });
    setShowAddForm(false);
  };

  const handleEditIncome = (incomeId: string) => {
    const amount = parseFloat(editAmount);
    if (amount > 0) {
      onUpdateIncome(incomeId, { amount });
      setEditAmount("");
      setEditingIncome(null);
    }
  };

  const toggleIncomeStatus = (incomeId: string, isActive: boolean) => {
    onUpdateIncome(incomeId, { isActive: !isActive });
  };

  const getFrequencyDisplay = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'bi-weekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      case 'one-time': return 'One-time';
      default: return frequency;
    }
  };

  const incomeData = getIncomeData();
  const totalExpectedMonthly = incomeData.reduce((sum, i) => sum + (i.isActive ? i.monthlyTarget : 0), 0);
  const totalCurrentMonth = incomeData.reduce((sum, i) => sum + i.currentEarned, 0);
  const incomeProgress = totalExpectedMonthly > 0 ? (totalCurrentMonth / totalExpectedMonthly) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Income Summary */}
      <Card className="shadow-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            Monthly Income Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Expected Monthly Income</p>
                <p className="text-2xl font-bold text-success">KSh {totalExpectedMonthly.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Earned This Month</p>
                <p className="text-2xl font-bold text-primary">
                  KSh {totalCurrentMonth.toLocaleString()}
                </p>
              </div>
            </div>
            <Progress value={Math.min(incomeProgress, 100)} className="h-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {incomeProgress.toFixed(1)}% of expected income achieved
              </span>
              <span className="text-sm text-muted-foreground">
                KSh {(totalExpectedMonthly - totalCurrentMonth).toLocaleString()} remaining
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Streams */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Income Streams</CardTitle>
              <CardDescription>Track and manage your various income sources</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-success to-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {incomeData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">💰</div>
              <p className="mb-2">No income streams configured</p>
              <p className="text-sm">Add your first income source to start tracking!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomeData.map((income) => {
                const progress = income.monthlyTarget > 0 ? (income.currentEarned / income.monthlyTarget) * 100 : 0;
                
                return (
                  <div key={income.id} className={`p-4 border rounded-lg bg-card hover:bg-accent/30 transition-colors ${!income.isActive ? 'opacity-60' : ''}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold text-lg">{income.category}</h3>
                          <p className="text-sm text-muted-foreground">{income.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {getFrequencyDisplay(income.frequency)}
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart className="h-3 w-3" />
                              Next: {new Date(income.nextDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant={income.isActive ? "default" : "secondary"}>
                          {income.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleIncomeStatus(income.id, income.isActive)}
                        >
                          {income.isActive ? "Pause" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingIncome(editingIncome === income.id ? null : income.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteIncome(income.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          KSh {income.currentEarned.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of KSh {income.monthlyTarget.toLocaleString()} expected
                        </span>
                      </div>
                      
                      {income.isActive && (
                        <>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {progress.toFixed(1)}% of target achieved
                            </span>
                            <span className="text-sm text-success">
                              KSh {income.amount.toLocaleString()} per {income.frequency.replace('-', ' ')}
                            </span>
                          </div>
                        </>
                      )}

                      {editingIncome === income.id && (
                        <div className="flex gap-2 mt-3 p-3 bg-muted rounded-lg">
                          <Input
                            type="number"
                            placeholder="New amount"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => handleEditIncome(income.id)}
                            disabled={!editAmount || parseFloat(editAmount) <= 0}
                            className="bg-gradient-to-r from-success to-primary"
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

      {/* Add Income Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Income Stream</CardTitle>
              <CardDescription>Configure a new source of income</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Quick Start Templates</Label>
                  <Select value={newIncome.template} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template or create custom" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_TEMPLATES.map((template) => (
                        <SelectItem key={template.category} value={template.category}>
                          {template.category} - KSh {template.amount.toLocaleString()}/{template.frequency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Income Category</Label>
                  <Select value={newIncome.category} onValueChange={(value) => setNewIncome({ ...newIncome, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                    placeholder="e.g., Monthly salary from XYZ Corp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KSh)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    placeholder="50000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={newIncome.frequency} onValueChange={(value: any) => setNewIncome({ ...newIncome, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextDate">Next Payment Date</Label>
                  <Input
                    id="nextDate"
                    type="date"
                    value={newIncome.nextDate}
                    onChange={(e) => setNewIncome({ ...newIncome, nextDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
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
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-success to-primary">
                    Add Income
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
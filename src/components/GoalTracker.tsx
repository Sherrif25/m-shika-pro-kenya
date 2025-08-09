import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Target, Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import { SavingsGoal } from "@/types/finance";

interface GoalTrackerProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, "id">) => void;
  onUpdateGoal: (goalId: string, amount: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

const GOAL_TEMPLATES = [
  { name: "Emergency Fund", amount: 50000, months: 12 },
  { name: "New Phone", amount: 25000, months: 6 },
  { name: "Laptop", amount: 60000, months: 8 },
  { name: "Vacation", amount: 30000, months: 6 },
  { name: "Wedding", amount: 200000, months: 24 },
  { name: "Business Capital", amount: 100000, months: 18 },
  { name: "Car Down Payment", amount: 150000, months: 15 },
  { name: "House Deposit", amount: 500000, months: 36 }
];

export default function GoalTracker({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }: GoalTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    template: ""
  });
  const [addAmount, setAddAmount] = useState("");

  const handleTemplateSelect = (template: string) => {
    const selectedTemplate = GOAL_TEMPLATES.find(t => t.name === template);
    if (selectedTemplate) {
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + selectedTemplate.months);
      
      setNewGoal({
        title: selectedTemplate.name,
        targetAmount: selectedTemplate.amount.toString(),
        deadline: deadline.toISOString().split('T')[0],
        template
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) return;

    onAddGoal({
      title: newGoal.title,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline
    });

    setNewGoal({ title: "", targetAmount: "", deadline: "", template: "" });
    setShowAddForm(false);
  };

  const handleAddMoney = (goalId: string) => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      onUpdateGoal(goalId, amount);
      setAddAmount("");
      setEditingGoal(null);
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress: number, daysRemaining: number) => {
    if (progress >= 100) return "text-success";
    if (daysRemaining < 30 && progress < 50) return "text-destructive";
    if (daysRemaining < 60 && progress < 75) return "text-warning";
    return "text-primary";
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Savings Goals
              </CardTitle>
              <CardDescription>Track your progress towards financial milestones</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-primary to-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">🎯</div>
              <p className="mb-2">No savings goals yet</p>
              <p className="text-sm">Set your first goal to start building wealth!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const daysRemaining = getDaysRemaining(goal.deadline);
                const monthlyTarget = goal.targetAmount / (daysRemaining > 0 ? Math.max(daysRemaining / 30, 1) : 1);
                
                return (
                  <div key={goal.id} className="p-4 border rounded-lg bg-card hover:bg-accent/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Deadline passed'}
                          </span>
                          <span>Monthly target: KSh {monthlyTarget.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingGoal(editingGoal === goal.id ? null : goal.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteGoal(goal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          KSh {goal.currentAmount.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          of KSh {goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      
                      <Progress value={Math.min(progress, 100)} className="h-3" />
                      
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant={progress >= 100 ? "default" : "secondary"}
                          className={getProgressColor(progress, daysRemaining)}
                        >
                          {progress.toFixed(1)}% Complete
                        </Badge>
                        {progress >= 100 && (
                          <Badge variant="default" className="bg-success text-success-foreground">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Goal Achieved!
                          </Badge>
                        )}
                      </div>

                      {editingGoal === goal.id && progress < 100 && (
                        <div className="flex gap-2 mt-3 p-3 bg-muted rounded-lg">
                          <Input
                            type="number"
                            placeholder="Add amount"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => handleAddMoney(goal.id)}
                            disabled={!addAmount || parseFloat(addAmount) <= 0}
                            className="bg-gradient-to-r from-success to-primary"
                          >
                            Add Money
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

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Savings Goal</CardTitle>
              <CardDescription>Set a target and deadline for your financial goal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Quick Start Templates</Label>
                  <Select value={newGoal.template} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a template or create custom" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_TEMPLATES.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name} - KSh {template.amount.toLocaleString()} in {template.months} months
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Goal Name</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Target Amount (KSh)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    placeholder="50000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
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
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary-dark">
                    Create Goal
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
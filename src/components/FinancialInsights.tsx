import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Target, Lightbulb, ArrowRight } from "lucide-react";
import { Transaction } from "@/types/finance";

interface FinancialInsightsProps {
  transactions: Transaction[];
}

export default function FinancialInsights({ transactions }: FinancialInsightsProps) {
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  
  // Calculate category spending
  const categorySpending = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  // Recommended spending limits (percentage of income)
  const spendingLimits = {
    'Food': 0.15, // 15% of income
    'Transport': 0.10, // 10% of income
    'Rent': 0.30, // 30% of income
    'Entertainment': 0.05, // 5% of income
    'Utilities': 0.10, // 10% of income
  };

  // Generate insights
  const insights = [];

  // Savings rate insight
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  if (savingsRate < 20) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      description: `You're saving only ${savingsRate.toFixed(1)}% of your income. Aim for at least 20%.`,
      action: 'Set up automatic savings'
    });
  } else {
    insights.push({
      type: 'success',
      title: 'Great Savings Rate!',
      description: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`,
      action: 'Consider investing your savings'
    });
  }

  // Category overspending alerts
  Object.entries(spendingLimits).forEach(([category, limit]) => {
    const spent = categorySpending[category] || 0;
    const recommended = totalIncome * limit;
    if (spent > recommended && totalIncome > 0) {
      const overspend = ((spent - recommended) / recommended) * 100;
      insights.push({
        type: 'alert',
        title: `High ${category} Spending`,
        description: `You've spent ${overspend.toFixed(0)}% more than recommended on ${category.toLowerCase()}.`,
        action: `Try to reduce ${category.toLowerCase()} expenses`
      });
    }
  });

  // M-Pesa usage insight
  const mpesaTransactions = transactions.filter(t => t.payment_method === 'M-Pesa' && t.amount < 0);
  const mpesaPercentage = totalExpenses > 0 ? (mpesaTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / totalExpenses) * 100 : 0;
  
  if (mpesaPercentage > 70) {
    insights.push({
      type: 'tip',
      title: 'Heavy M-Pesa User',
      description: `${mpesaPercentage.toFixed(0)}% of your spending is through M-Pesa. Great for tracking!`,
      action: 'Keep using M-Pesa for better expense tracking'
    });
  }

  // Weekly spending pattern
  const thisWeekSpending = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return transactionDate >= weekStart && t.amount < 0;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const avgWeeklySpending = totalExpenses / 4; // Rough estimate
  
  if (thisWeekSpending > avgWeeklySpending * 1.5) {
    insights.push({
      type: 'warning',
      title: 'High Spending Week',
      description: `This week you've spent KSh ${thisWeekSpending.toLocaleString()}, which is above your average.`,
      action: 'Review your recent purchases'
    });
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'success': return <TrendingUp className="h-5 w-5 text-success" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'tip': return <Lightbulb className="h-5 w-5 text-primary" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-warning-light border-warning';
      case 'success': return 'bg-success-light border-success';
      case 'alert': return 'bg-destructive/10 border-destructive';
      case 'tip': return 'bg-primary/10 border-primary';
      default: return 'bg-muted border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Financial Health Overview
          </CardTitle>
          <CardDescription>Key metrics for your financial wellness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Savings Rate</span>
                <span className="font-medium">{savingsRate.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(savingsRate, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">Target: 20%+</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expense Ratio</span>
                <span className="font-medium">{totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : 0}%</span>
              </div>
              <Progress value={totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0} className="h-2" />
              <p className="text-xs text-muted-foreground">Target: &lt;80%</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">M-Pesa Usage</span>
                <span className="font-medium">{mpesaPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={mpesaPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">Higher = Better tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Insights */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Your Financial Insights
          </CardTitle>
          <CardDescription>Personalized tips based on your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary-dark">
                        {insight.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">🎯</div>
              <p>Start adding transactions to get personalized insights</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Financial Tips */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Tips for Kenya</CardTitle>
          <CardDescription>Smart money habits for better financial health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">💡 Saving</Badge>
              <p className="text-sm">Use M-Shaba or fixed deposit accounts to earn interest on your savings and avoid impulse spending.</p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">🚌 Transport</Badge>
              <p className="text-sm">Consider using matatu saccos or digital wallets for better fare tracking and potential discounts.</p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">📱 Airtime</Badge>
              <p className="text-sm">Buy airtime and data bundles in bulk during promotions to save on communication costs.</p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="secondary" className="mb-2">🏠 Bills</Badge>
              <p className="text-sm">Set up automatic bill payments through M-Pesa to avoid late fees and build good credit history.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
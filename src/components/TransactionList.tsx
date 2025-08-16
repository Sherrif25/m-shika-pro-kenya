import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Car, 
  Home, 
  Smartphone,
  Coffee,
  Heart,
  GraduationCap,
  Zap,
  MoreHorizontal
} from "lucide-react";
import { Transaction } from "@/types/finance";

interface TransactionListProps {
  transactions: Transaction[];
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<any>> = {
  Food: Coffee,
  Transport: Car,
  Rent: Home,
  Utilities: Zap,
  Airtime: Smartphone,
  Entertainment: MoreHorizontal,
  Healthcare: Heart,
  Education: GraduationCap,
  Shopping: ShoppingBag,
  Income: TrendingUp,
  Other: MoreHorizontal
};

export default function TransactionList({ transactions }: TransactionListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-KE', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "M-Pesa": return "bg-success text-success-foreground";
      case "Cash": return "bg-warning text-warning-foreground";
      case "Bank": return "bg-primary text-primary-foreground";
      case "Card": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">💰</div>
            <p>No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const IconComponent = categoryIcons[transaction.category] || MoreHorizontal;
              const isIncome = transaction.amount > 0;
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isIncome ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      <IconComponent className={`h-4 w-4 ${isIncome ? 'text-success' : 'text-destructive'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{transaction.description || transaction.category}</p>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getPaymentMethodColor(transaction.payment_method)}`}
                        >
                          {transaction.payment_method}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold ${isIncome ? 'text-success' : 'text-destructive'}`}>
                      {isIncome ? '+' : ''}KSh {Math.abs(transaction.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
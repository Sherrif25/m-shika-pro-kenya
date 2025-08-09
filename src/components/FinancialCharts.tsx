import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/finance";

interface FinancialChartsProps {
  transactions: Transaction[];
}

export default function FinancialCharts({ transactions }: FinancialChartsProps) {
  // Category breakdown for pie chart
  const categoryData = transactions
    .filter(t => t.amount < 0) // Only expenses
    .reduce((acc, transaction) => {
      const category = transaction.category;
      const existing = acc.find(item => item.name === category);
      if (existing) {
        existing.value += Math.abs(transaction.amount);
      } else {
        acc.push({
          name: category,
          value: Math.abs(transaction.amount)
        });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  // Weekly spending trend
  const weeklyData = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = acc.find(item => item.week === weekKey);
      if (existing) {
        existing.spending += Math.abs(transaction.amount);
      } else {
        acc.push({
          week: weekKey,
          spending: Math.abs(transaction.amount),
          weekLabel: `Week of ${weekStart.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`
        });
      }
      return acc;
    }, [] as { week: string; spending: number; weekLabel: string }[])
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-4); // Last 4 weeks

  // Payment method breakdown
  const paymentMethodData = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, transaction) => {
      const method = transaction.paymentMethod;
      const existing = acc.find(item => item.method === method);
      if (existing) {
        existing.amount += Math.abs(transaction.amount);
      } else {
        acc.push({
          method,
          amount: Math.abs(transaction.amount)
        });
      }
      return acc;
    }, [] as { method: string; amount: number }[]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Where your money goes</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `KSh ${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.slice(0, 6).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate">{item.name}</span>
                    <span className="font-medium">KSh {item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <p>No spending data yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Spending Trend */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
          <CardDescription>Your weekly spending pattern</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="weekLabel" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Spending']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="spending" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl mb-2">📈</div>
                <p>Not enough data for trends</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="shadow-md lg:col-span-2">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>How you spend your money</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethodData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="method" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, 'Amount']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl mb-2">💳</div>
                <p>No payment data yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
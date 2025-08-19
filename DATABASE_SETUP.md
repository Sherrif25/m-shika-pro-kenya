# Database Setup Instructions

Your app is losing data because the required database tables haven't been created in Supabase yet. Please follow these steps:

## 1. Go to your Supabase Dashboard
- Open https://supabase.com/dashboard
- Select your project

## 2. Run the SQL Schema
Go to the SQL Editor and run this SQL to create all required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget_targets table
CREATE TABLE IF NOT EXISTS budget_targets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    monthly_limit DECIMAL(10,2) NOT NULL,
    current_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create income_streams table
CREATE TABLE IF NOT EXISTS income_streams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_streams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Savings goals policies
CREATE POLICY "Users can view own savings goals" ON savings_goals
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings goals" ON savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings goals" ON savings_goals
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings goals" ON savings_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Budget targets policies
CREATE POLICY "Users can view own budget targets" ON budget_targets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budget targets" ON budget_targets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budget targets" ON budget_targets
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budget targets" ON budget_targets
    FOR DELETE USING (auth.uid() = user_id);

-- Income streams policies
CREATE POLICY "Users can view own income streams" ON income_streams
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own income streams" ON income_streams
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own income streams" ON income_streams
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own income streams" ON income_streams
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_targets_user_id ON budget_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_income_streams_user_id ON income_streams(user_id);
```

## 3. Verify Tables Created
After running the SQL, you should see these tables in your Supabase Table Editor:
- transactions
- savings_goals  
- budget_targets
- income_streams

## 4. Test the App
Once the tables are created, refresh your app and try adding some data. It should now persist properly across refreshes and logins.

## Mobile App Icon
The mobile app icon has been added and configured for Capacitor. When you build for mobile, it will use the generated icon.
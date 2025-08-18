import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Transaction, SavingsGoal, BudgetTarget, IncomeStream } from '@/types/finance'

export function useUserData() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [budgetTargets, setBudgetTargets] = useState<BudgetTarget[]>([])
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([])
  const [loading, setLoading] = useState(true)

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setTransactions([])
      setSavingsGoals([])
      setBudgetTargets([])
      setIncomeStreams([])
      setLoading(false)
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (transactionsError) throw transactionsError

      // Load savings goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)

      if (goalsError) throw goalsError

      // Load budget targets
      const { data: budgetData, error: budgetError } = await supabase
        .from('budget_targets')
        .select('*')
        .eq('user_id', user.id)

      if (budgetError) throw budgetError

      // Load income streams
      const { data: incomeData, error: incomeError } = await supabase
        .from('income_streams')
        .select('*')
        .eq('user_id', user.id)

      if (incomeError) throw incomeError

      setTransactions(transactionsData || [])
      setSavingsGoals(goalsData || [])
      setBudgetTargets(budgetData || [])
      setIncomeStreams(incomeData || [])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setTransactions(prev => [data, ...prev])
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'user_id'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{ ...goal, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setSavingsGoals(prev => [...prev, data])
    } catch (error) {
      console.error('Error adding savings goal:', error)
      throw error
    }
  }

  const updateSavingsGoal = async (goalId: string, currentAmount: number) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update({ current_amount: currentAmount })
        .eq('id', goalId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setSavingsGoals(prev => 
        prev.map(goal => goal.id === goalId ? data : goal)
      )
    } catch (error) {
      console.error('Error updating savings goal:', error)
      throw error
    }
  }

  const deleteSavingsGoal = async (goalId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id)

      if (error) throw error

      setSavingsGoals(prev => prev.filter(goal => goal.id !== goalId))
    } catch (error) {
      console.error('Error deleting savings goal:', error)
      throw error
    }
  }

  const addBudgetTarget = async (budget: Omit<BudgetTarget, 'id' | 'user_id' | 'currentSpent'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('budget_targets')
        .insert([{ ...budget, user_id: user.id, current_spent: 0 }])
        .select()
        .single()

      if (error) throw error

      setBudgetTargets(prev => [...prev, data])
    } catch (error) {
      console.error('Error adding budget target:', error)
      throw error
    }
  }

  const updateBudgetTarget = async (budgetId: string, monthlyLimit: number) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('budget_targets')
        .update({ monthly_limit: monthlyLimit })
        .eq('id', budgetId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setBudgetTargets(prev => 
        prev.map(budget => budget.id === budgetId ? data : budget)
      )
    } catch (error) {
      console.error('Error updating budget target:', error)
      throw error
    }
  }

  const deleteBudgetTarget = async (budgetId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('budget_targets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', user.id)

      if (error) throw error

      setBudgetTargets(prev => prev.filter(budget => budget.id !== budgetId))
    } catch (error) {
      console.error('Error deleting budget target:', error)
      throw error
    }
  }

  const addIncomeStream = async (income: Omit<IncomeStream, 'id' | 'user_id'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('income_streams')
        .insert([{ ...income, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      setIncomeStreams(prev => [...prev, data])
    } catch (error) {
      console.error('Error adding income stream:', error)
      throw error
    }
  }

  const updateIncomeStream = async (incomeId: string, updates: Partial<IncomeStream>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('income_streams')
        .update(updates)
        .eq('id', incomeId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setIncomeStreams(prev => 
        prev.map(income => income.id === incomeId ? data : income)
      )
    } catch (error) {
      console.error('Error updating income stream:', error)
      throw error
    }
  }

  const deleteIncomeStream = async (incomeId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('income_streams')
        .delete()
        .eq('id', incomeId)
        .eq('user_id', user.id)

      if (error) throw error

      setIncomeStreams(prev => prev.filter(income => income.id !== incomeId))
    } catch (error) {
      console.error('Error deleting income stream:', error)
      throw error
    }
  }

  return {
    transactions,
    savingsGoals,
    budgetTargets,
    incomeStreams,
    loading,
    addTransaction,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addBudgetTarget,
    updateBudgetTarget,
    deleteBudgetTarget,
    addIncomeStream,
    updateIncomeStream,
    deleteIncomeStream,
    refreshData: loadUserData
  }
}
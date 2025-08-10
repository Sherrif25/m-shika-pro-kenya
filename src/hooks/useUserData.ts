import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Transaction, SavingsGoal } from '@/types/finance'

export function useUserData() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setTransactions([])
      setSavingsGoals([])
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

      setTransactions(transactionsData || [])
      setSavingsGoals(goalsData || [])
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

  return {
    transactions,
    savingsGoals,
    loading,
    addTransaction,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    refreshData: loadUserData
  }
}
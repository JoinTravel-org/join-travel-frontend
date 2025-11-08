import { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress, Container, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import expenseService from '../../services/expense.service';
import ExpenseTable from '../expenses/ExpenseTable';
import AddExpenseForm from '../expenses/AddExpenseForm';
import type { Expense } from '../../types/expense';

interface GroupExpensesProps {
  groupId?: string; // Optional now
}

export default function GroupExpenses({ groupId }: GroupExpensesProps) {
  const auth = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState<string>('0.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expenseService.getGroupExpenses(groupId);
      setExpenses(response.data.expenses);
      setTotal(response.data.total);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'Error al cargar los gastos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [groupId]);

  const handleExpenseAdded = () => {
    fetchExpenses();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      return;
    }

    try {
      await expenseService.deleteExpense(expenseId);
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el gasto.');
    }
  };

  const canDeleteExpense = (expense: Expense): boolean => {
    // User can delete their own expenses
    // Note: Group admin check would require fetching group info, keeping it simple for now
    return expense.userId === auth.user?.id;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Gastos del Grupo
      </Typography>

      {groupId && (
        <Box sx={{ mb: 3 }}>
          <AddExpenseForm groupId={groupId} onExpenseAdded={handleExpenseAdded} />
        </Box>
      )}

      <ExpenseTable
        expenses={expenses}
        total={total}
        onDeleteExpense={handleDeleteExpense}
        canDeleteExpense={canDeleteExpense}
        showGroupColumn={!groupId}
      />
    </Container>
  );
}
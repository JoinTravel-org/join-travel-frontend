import React, { useEffect, useState } from "react";
import {
  Box,
  Alert,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import expenseService from "../../services/expense.service";
import groupService from "../../services/group.service";
import ExpenseTable from "../expenses/ExpenseTable";
import AddExpenseForm from "../expenses/AddExpenseForm";
import type { Expense } from "../../types/expense";

interface GroupExpensesProps {
  groupId?: string; // Optional now
}

export default function GroupExpenses({ groupId }: GroupExpensesProps) {
  const auth = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState<string>("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expenseService.getGroupExpenses(groupId);
      setExpenses(response.data.expenses);
      setTotal(response.data.total);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar los gastos.";
      console.error("Error fetching expenses:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupInfo = async () => {
    if (!groupId) return;

    try {
      const response = await groupService.getGroupById(groupId);
      if (response.success && response.data) {
        setIsAdmin(response.data.adminId === auth.user?.id);
      }
    } catch (err) {
      console.error("Error fetching group info:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchGroupInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleExpenseAdded = () => {
    fetchExpenses();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
      return;
    }

    try {
      await expenseService.deleteExpense(expenseId);
      fetchExpenses();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar el gasto.";
      alert(errorMessage);
    }
  };

  const canDeleteExpense = (_expense: Expense): boolean => {
    // Only group admin can delete expenses
    return isAdmin;
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
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Different header and styling based on context */}
      {groupId ? (
        // Group-specific expenses view (Admin mode)
        <>
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "primary.light",
              borderRadius: 1,
              border: "2px solid",
              borderColor: "primary.main",
            }}
          >
            <Typography variant="h5" component="h2" sx={{ color: "primary.contrastText", fontWeight: 600 }}>
              📊 Gestión de Gastos del Grupo
            </Typography>
            <Typography variant="body2" sx={{ color: "primary.contrastText", mt: 0.5 }}>
              {isAdmin 
                ? "Como administrador, puedes crear, asignar y eliminar gastos de este grupo"
                : "Visualización de todos los gastos de este grupo"}
            </Typography>
          </Box>

          {/* Only show add expense form if user is admin */}
          {isAdmin && (
            <Box sx={{ mb: 3 }}>
              <AddExpenseForm
                groupId={groupId}
                onExpenseAdded={handleExpenseAdded}
              />
            </Box>
          )}
        </>
      ) : (
        // Personal expenses view (User mode)
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "success.light",
            borderRadius: 1,
            border: "2px solid",
            borderColor: "success.main",
          }}
        >
          <Typography variant="h5" component="h2" sx={{ color: "success.contrastText", fontWeight: 600 }}>
            💰 Mis Gastos Personales
          </Typography>
          <Typography variant="body2" sx={{ color: "success.contrastText", mt: 0.5 }}>
            Resumen de todos los gastos asignados a ti en los diferentes grupos
          </Typography>
        </Box>
      )}

      <ExpenseTable
        expenses={expenses}
        total={total}
        groupId={groupId}
        isAdmin={isAdmin}
        onDeleteExpense={handleDeleteExpense}
        onExpenseAssigned={handleExpenseAdded}
        canDeleteExpense={canDeleteExpense}
        showGroupColumn={!groupId}
      />
    </Container>
  );
}

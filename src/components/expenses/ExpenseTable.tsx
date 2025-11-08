import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Expense } from '../../types/expense';

interface ExpenseTableProps {
  expenses: Expense[];
  total: string;
  onDeleteExpense: (expenseId: string) => void;
  canDeleteExpense: (expense: Expense) => boolean;
}

export default function ExpenseTable({
  expenses,
  total,
  onDeleteExpense,
  canDeleteExpense,
}: ExpenseTableProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Gastos del Grupo
      </Typography>

      {expenses.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay gastos registrados aún.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Concepto</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.concept}</TableCell>
                    <TableCell align="right">${expense.amount}</TableCell>
                    <TableCell>
                      {expense.user?.username || expense.user?.email || 'Usuario desconocido'}
                    </TableCell>
                    <TableCell align="center">
                      {canDeleteExpense(expense) && (
                        <Tooltip title="Eliminar gasto">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDeleteExpense(expense.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Total: ${total}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
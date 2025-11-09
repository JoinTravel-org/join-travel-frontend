import React, { useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import type { Expense } from "../../types/expense";
import AssignExpenseDialog from "./AssignExpenseDialog";

interface ExpenseTableProps {
  expenses: Expense[];
  total: string;
  groupId?: string;
  isAdmin: boolean;
  onDeleteExpense: (expenseId: string) => void;
  onExpenseAssigned: () => void;
  canDeleteExpense: (expense: Expense) => boolean;
  showGroupColumn?: boolean;
}

export default function ExpenseTable({
  expenses,
  total,
  groupId,
  isAdmin,
  onDeleteExpense,
  onExpenseAssigned,
  canDeleteExpense,
  showGroupColumn = false,
}: ExpenseTableProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleOpenAssignDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedExpense(null);
  };

  const handleExpenseAssigned = () => {
    onExpenseAssigned();
    handleCloseAssignDialog();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {showGroupColumn ? "Todos mis Gastos" : "Gastos del Grupo"}
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
                  {showGroupColumn && <TableCell>Grupo</TableCell>}
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Registrado por</TableCell>
                  <TableCell>Pagado por</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.concept}</TableCell>
                    {showGroupColumn && (
                      <TableCell>
                        {expense.group?.name || "Grupo desconocido"}
                      </TableCell>
                    )}
                    <TableCell align="right">${expense.amount}</TableCell>
                    <TableCell>
                      {expense.user?.email || "Usuario desconocido"}
                    </TableCell>
                    <TableCell>
                      {expense.paidBy
                        ? expense.paidBy.email
                        : "Sin especificar"}
                    </TableCell>
                    <TableCell align="center">
                      {isAdmin && (
                        <Tooltip title="Asignar gasto">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenAssignDialog(expense)}
                          >
                            <AssignmentIndIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Total: ${total}
            </Typography>
          </Box>
        </>
      )}

      {groupId && (
        <AssignExpenseDialog
          open={assignDialogOpen}
          expense={selectedExpense}
          groupId={groupId}
          onClose={handleCloseAssignDialog}
          onAssigned={handleExpenseAssigned}
        />
      )}
    </Box>
  );
}

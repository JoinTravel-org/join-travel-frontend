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
      {expenses.length === 0 ? (
        <Box sx={{ 
          textAlign: "center", 
          py: 4, 
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider"
        }}>
          <Typography variant="body1" color="text.secondary">
            {showGroupColumn 
              ? "No tienes gastos asignados en ningún grupo aún."
              : "No hay gastos registrados en este grupo aún."}
          </Typography>
          {!showGroupColumn && isAdmin && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Usa el formulario de arriba para agregar el primer gasto
            </Typography>
          )}
        </Box>
      ) : (
        <>
          <TableContainer 
            component={Paper} 
            sx={{ 
              mb: 2,
              boxShadow: 3,
              border: showGroupColumn ? "2px solid" : "1px solid",
              borderColor: showGroupColumn ? "success.main" : "divider",
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: showGroupColumn ? "success.light" : "primary.light" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: showGroupColumn ? "inherit" : "primary.contrastText" }}>Concepto</TableCell>
                  {showGroupColumn && <TableCell sx={{ fontWeight: 600, color: "inherit" }}>Grupo</TableCell>}
                  <TableCell align="right" sx={{ fontWeight: 600, color: showGroupColumn ? "inherit" : "primary.contrastText" }}>Monto</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: showGroupColumn ? "inherit" : "primary.contrastText" }}>Registrado por</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: showGroupColumn ? "inherit" : "primary.contrastText" }}>
                    {showGroupColumn ? "Asignado a" : "Pagado por"}
                  </TableCell>
                  {!showGroupColumn && <TableCell align="center" sx={{ fontWeight: 600, color: "primary.contrastText" }}>Acciones</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => {
                  const currentUserId = localStorage.getItem("userId");
                  const isAssignedToMe = expense.paidById === currentUserId;
                  
                  return (
                    <TableRow 
                      key={expense.id}
                      sx={{
                        bgcolor: showGroupColumn && isAssignedToMe 
                          ? "rgba(46, 125, 50, 0.08)" 
                          : "background.paper",
                        "&:hover": {
                          bgcolor: showGroupColumn && isAssignedToMe
                            ? "rgba(46, 125, 50, 0.15)"
                            : "action.hover",
                        }
                      }}
                    >
                      <TableCell>{expense.concept}</TableCell>
                      {showGroupColumn && (
                        <TableCell>
                          <strong>{expense.group?.name || "Grupo desconocido"}</strong>
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <strong style={{ fontSize: "1.1rem" }}>${expense.amount}</strong>
                      </TableCell>
                      <TableCell>
                        {expense.user?.email || "Usuario desconocido"}
                      </TableCell>
                      <TableCell>
                        {expense.paidBy ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {expense.paidBy.email}
                            {showGroupColumn && isAssignedToMe && (
                              <Box
                                component="span"
                                sx={{
                                  bgcolor: "success.main",
                                  color: "white",
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                              >
                                TÚ
                              </Box>
                            )}
                          </Box>
                        ) : (
                          <Box component="span" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                            Sin asignar
                          </Box>
                        )}
                      </TableCell>
                      {!showGroupColumn && (
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
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              p: 2,
              bgcolor: showGroupColumn ? "rgba(46, 125, 50, 0.08)" : "rgba(5, 68, 94, 0.08)",
              borderRadius: 1,
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

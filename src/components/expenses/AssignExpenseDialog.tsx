import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import type { Expense } from "../../types/expense";
import type { User } from "../../types/user";

interface AssignExpenseDialogProps {
  open: boolean;
  expense: Expense | null;
  groupId: string;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignExpenseDialog({
  open,
  expense,
  groupId,
  onClose,
  onAssigned,
}: AssignExpenseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");

  // Cargar miembros del grupo
  useEffect(() => {
    const loadMembers = async () => {
      if (!open || !groupId) return;

      setLoadingMembers(true);
      try {
        const { default: groupService } = await import(
          "../../services/group.service"
        );
        const response = await groupService.getGroupById(groupId);

        if (response.success && response.data.members) {
          // Incluir al admin si no está en la lista de miembros
          const allMembers = [...response.data.members];
          if (
            response.data.admin &&
            !allMembers.some((m) => m.id === response.data.admin?.id)
          ) {
            allMembers.push(response.data.admin);
          }
          setMembers(allMembers);
        }
      } catch (err) {
        console.error("Error loading group members:", err);
        setError("Error al cargar los miembros del grupo");
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [open, groupId]);

  // Inicializar selectedMember con paidById si existe
  useEffect(() => {
    if (expense?.paidById) {
      setSelectedMember(expense.paidById);
    } else {
      setSelectedMember("");
    }
  }, [expense]);

  const handleAssign = async () => {
    if (!expense || !selectedMember) {
      setError("Debe seleccionar un miembro");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { default: expenseService } = await import(
        "../../services/expense.service"
      );
      await expenseService.assignExpense(expense.id, {
        paidById: selectedMember,
      });
      onAssigned();
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSelectedMember("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Asignar gasto: {expense?.concept}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormControl fullWidth margin="dense" sx={{ mt: 1 }}>
          <InputLabel id="member-select-label">Pagado por</InputLabel>
          <Select
            labelId="member-select-label"
            value={selectedMember}
            label="Pagado por"
            onChange={(e) => setSelectedMember(e.target.value)}
            disabled={loadingMembers || loading}
          >
            {members.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || !selectedMember}
        >
          {loading ? <CircularProgress size={24} /> : "Asignar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

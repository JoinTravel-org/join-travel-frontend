import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { CreateExpenseRequest } from "../../types/expense";
import type { User } from "../../types/user";

interface AddExpenseFormProps {
  groupId: string;
  onExpenseAdded: () => void;
}

export default function AddExpenseForm({
  groupId,
  onExpenseAdded,
}: AddExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [form, setForm] = useState<CreateExpenseRequest>({
    concept: "",
    amount: "",
    paidById: undefined,
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setForm({ concept: "", amount: "", paidById: undefined });
  };

  // Cargar miembros del grupo cuando se abre el diálogo
  useEffect(() => {
    const loadMembers = async () => {
      if (!open) return;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "amount") {
      // Allow only numbers and decimal point, limit to 2 decimal places
      const regex = /^\d*\.?\d{0,2}$/;
      if (!regex.test(value)) {
        return;
      }
      // Prevent values that would cause precision issues
      // Allow up to 11 characters for amounts like "9999999.99" (10 digits + decimal + 2 decimals)
      if (value.length > 11) {
        return;
      }
    }

    setForm({
      ...form,
      [name]: value,
    });
    setError(null);
  };

  const handleSelectChange = (value: string) => {
    setForm({
      ...form,
      paidById: value || undefined,
    });
    setError(null);
  };

  const validateAmount = (amount: string): boolean => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount >= 0.01 && numAmount <= 9999999.99;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.concept.trim()) {
      setError("El concepto es obligatorio.");
      return;
    }

    if (!validateAmount(form.amount)) {
      setError("Valor incorrecto.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { default: expenseService } = await import(
        "../../services/expense.service"
      );
      await expenseService.createExpense(groupId, form);
      handleClose();
      onExpenseAdded();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Agregar Gasto
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Agregar Nuevo Gasto</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              name="concept"
              label="Concepto"
              fullWidth
              variant="outlined"
              value={form.concept}
              onChange={handleChange}
              required
              inputProps={{ maxLength: 100 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="amount"
              label="Monto"
              fullWidth
              variant="outlined"
              value={form.amount}
              onChange={handleChange}
              required
              placeholder="0.00"
              helperText="Monto entre 0.01 y 9,999,999.99 con máximo 2 decimales"
              inputProps={{
                inputMode: "decimal",
                pattern: "[0-9]*[.,]?[0-9]*",
              }}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="paid-by-label">Pagado por</InputLabel>
              <Select
                labelId="paid-by-label"
                value={form.paidById || ""}
                label="Pagado por"
                onChange={(e) => handleSelectChange(e.target.value)}
                disabled={loadingMembers}
              >
                <MenuItem value="">
                  <em>Sin especificar</em>
                </MenuItem>
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !form.concept.trim() || !form.amount}
            >
              {loading ? <CircularProgress size={24} /> : "Agregar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

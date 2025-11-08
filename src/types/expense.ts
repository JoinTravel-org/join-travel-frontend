export interface CreateExpenseRequest {
  concept: string;
  amount: string; // String to preserve decimal precision
}

export interface AssignExpenseRequest {
  paidById: string;
}

export interface Expense {
  id: string;
  concept: string;
  amount: string; // String to preserve decimal precision
  groupId: string;
  userId: string;
  paidById?: string | null;
  user?: {
    id: string;
    email: string;
  };
  paidBy?: {
    id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseResponse {
  success: boolean;
  data: Expense;
  message?: string;
}

export interface GroupExpensesResponse {
  success: boolean;
  data: {
    expenses: Expense[];
    total: string; // String to preserve decimal precision
  };
}

export interface DeleteExpenseResponse {
  success: boolean;
  data: {
    message: string;
  };
}

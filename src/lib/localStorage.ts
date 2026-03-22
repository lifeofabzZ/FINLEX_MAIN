export interface Expense {
  _id?: string;
  id?: string; // legacy support
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'manual' | 'upload';
  createdAt?: string;
  walletAddress?: string; // Links expense to a wallet
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const saveExpense = async (expense: Omit<Expense, '_id' | 'id' | 'createdAt'>): Promise<Expense> => {
  const currentWallet = localStorage.getItem('walletAddress');
  if (!currentWallet) throw new Error("Wallet not connected");

  const newExpense = {
    ...expense,
    walletAddress: currentWallet
  };

  const response = await fetch(`${API_BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newExpense)
  });

  if (!response.ok) throw new Error("Failed to save expense");
  return response.json();
};

export const getExpenses = async (): Promise<Expense[]> => {
  const currentWallet = localStorage.getItem('walletAddress');
  if (!currentWallet) return [];

  const response = await fetch(`${API_BASE_URL}/api/expenses/${currentWallet}`);
  if (!response.ok) return [];

  const data = await response.json();
  // Map _id to id for backwards compatibility if needed
  return data.map((exp: any) => ({ ...exp, id: exp._id }));
};

export const deleteExpense = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error("Failed to delete expense");
};

export const updateExpense = async (id: string, updatedExpense: Partial<Expense>): Promise<Expense> => {
  // Assuming a PUT endpoint exists or we implement it later. For now, fallback to error conceptually.
  throw new Error('Update expense via API not fully implemented yet.');
};
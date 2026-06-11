export interface MonthRow {
  period: string;     // 'YYYY-MM'
  revenue: number;
  expenses: number;
  profit: number;
  cashflow: number;
}

export interface AccountRow {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'income' | 'expense';
  debit: number;
  credit: number;
  net: number;
}

export interface Summary {
  tenant: string;
  months: MonthRow[];
  accounts: AccountRow[];
}

export interface AskResponse {
  answer: string;
}

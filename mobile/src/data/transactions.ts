export type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  isDeductible: boolean;
  date: string;
};

export let transactions: Transaction[] = [
  {
    id: 1,
    title: "Sales Revenue",
    amount: 2500,
    type: "income",
    category: "Sales",
    isDeductible: false,
    date: "2026-06-01",
  },

  {
    id: 2,
    title: "Office Supplies",
    amount: 400,
    type: "expense",
    category: "Office Supplies",
    isDeductible: true,
    date: "2026-06-03",
  },

  {
    id: 3,
    title: "Internet Bill",
    amount: 120,
    type: "expense",
    category: "Utilities",
    isDeductible: true,
    date: "2026-06-05",
  },

  {
    id: 4,
    title: "Consulting Revenue",
    amount: 1000,
    type: "income",
    category: "Consulting",
    isDeductible: false,
    date: "2026-06-07",
  },
];

export function addTransaction(
  transaction: Transaction
) {
  transactions.push(transaction);
}
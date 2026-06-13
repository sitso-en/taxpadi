export type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
};

export let transactions: Transaction[] = [
  {
    id: 1,
    title: "Sales Revenue",
    amount: 2500,
    type: "income",
  },
  {
    id: 2,
    title: "Office Supplies",
    amount: 400,
    type: "expense",
  },
  {
    id: 3,
    title: "Internet Bill",
    amount: 120,
    type: "expense",
  },
  {
    id: 4,
    title: "Consulting Revenue",
    amount: 1000,
    type: "income",
  },
];
export function addTransaction(transaction: Transaction) {
  transactions.push(transaction);
}

export type Transaction = {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
};

export let transactions: Transaction[] = [
  {
  id: 1,
  title: "Sales Revenue",
  amount: 2500,
  type: "income",
  category: "Sales",
},
  {
  id: 2,
  title: "Office Supplies",
  amount: 400,
  type: "expense",
  category: "Office Supplies",
},
  {
  id: 3,
  title: "Internet Bill",
  amount: 120,
  type: "expense",
  category: "Utilities",
},
  {
  id: 4,
  title: "Consulting Revenue",
  amount: 1000,
  type: "income",
  category: "Consulting",
},
];
export function addTransaction(transaction: Transaction) {
  transactions.push(transaction);
}

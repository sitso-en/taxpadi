export type Payment = {
  id: number;
  description: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending";
};

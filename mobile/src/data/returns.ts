export type TaxReturn = {
  id: number;
  taxType: string;
  dueDate: string;
  status: "Pending" | "Filed";
};
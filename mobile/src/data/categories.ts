// Single source of truth for transaction categories.
//
// Expense categories are free-form bookkeeping labels.
// Income categories are the Ghana withholding-tax payment types — their `value`
// MUST match the keys the backend's getWhtRate(category) understands, so that
// checking "Withholding Tax Applicable" produces the correct WHT amount.

export type CategoryOption = {
  label: string;
  value: string;
  /** WHT rate as a decimal (income categories only), e.g. 0.075 for 7.5% */
  whtRate?: number;
};

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  { label: "Rent", value: "Rent" },
  { label: "Utilities", value: "Utilities" },
  { label: "Transport", value: "Transport" },
  { label: "Food", value: "Food" },
  { label: "Supplies", value: "Supplies" },
  { label: "Equipment", value: "Equipment" },
  { label: "Other", value: "Other" },
];

export const INCOME_CATEGORIES: CategoryOption[] = [
  { label: "Goods sold", value: "goods", whtRate: 0.03 },
  { label: "Services rendered", value: "services", whtRate: 0.075 },
  { label: "Contract / works", value: "works", whtRate: 0.05 },
  { label: "Rent – residential", value: "rent_residential", whtRate: 0.08 },
  { label: "Rent – commercial", value: "rent_commercial", whtRate: 0.15 },
  { label: "Dividends", value: "dividends", whtRate: 0.08 },
  { label: "Interest", value: "interest", whtRate: 0.08 },
  { label: "Royalties", value: "royalties", whtRate: 0.15 },
  { label: "Director's fees", value: "director_fees", whtRate: 0.20 },
];

export const getCategories = (type: "income" | "expense"): CategoryOption[] =>
  type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

const LABEL_BY_VALUE: Record<string, string> = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
].reduce((acc, c) => {
  acc[c.value] = c.label;
  return acc;
}, {} as Record<string, string>);

/** Friendly display label for a stored category value (falls back to the raw value). */
export const formatCategory = (value?: string | null): string => {
  if (!value) return "";
  return LABEL_BY_VALUE[value] ?? value;
};

/** WHT rate for an income category value, or null if it has none. */
export const whtRateForCategory = (value?: string | null): number | null => {
  if (!value) return null;
  const match = INCOME_CATEGORIES.find((c) => c.value === value);
  return match?.whtRate ?? null;
};

/** WHT rate formatted as a percentage string, e.g. "7.5%". */
export const formatWhtRate = (rate: number): string =>
  `${(rate * 100).toString().replace(/\.0+$/, "")}%`;

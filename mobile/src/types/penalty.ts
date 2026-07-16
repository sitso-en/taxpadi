export interface Penalty {
  tax_type: string;
  deadline_date: string;
  days_late: number;
  base_penalty: number;
  daily_penalty: number;
  interest_amount: number;
  total_penalty: number;
  penalty_active: boolean;
  existing_penalty_id: string;
}

export interface PenaltyResponse {
  success: boolean;
  data: Penalty;
  message: string;
  timestamp: string;
}

export interface ResolvePenaltyResponse {
  success: boolean;
  data: {
    penalty_id: string;
    tax_type: string;
    deadline_date: string;
    filing_date: string;
    days_late: number;
    total_penalty: number;
    daily_rate: number;
    penalty_grows_by_daily: number;
    resolved: boolean;
    resolved_at: string;
    guidance: {
      message: string;
      steps: string[];
    };
  };
  message: string;
  timestamp: string;
}
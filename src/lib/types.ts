export type StageId =
  | "lead"
  | "consult"
  | "quote"
  | "negotiate"
  | "contract"
  | "schedule"
  | "delivered"
  | "aftercare"
  | "lost";

export type Heat = "hot" | "warm" | "cool" | "risk";

export type HistoryEntry = {
  date: string;
  type: string;
  note: string;
};

export type Customer = {
  id: string;
  name: string;
  honorific?: string;
  vehicle?: string;
  trim?: string;
  color?: string;
  phone?: string;
  stage: StageId;
  stageRaw?: string;
  budget?: string;
  timeframe?: string;
  decisionMaker?: string;
  issues?: string;
  source?: string;
  lastContactDate?: string;
  nextActionLabel?: string;
  nextActionDue?: string;
  notes?: string;
  history?: HistoryEntry[];
  transcriptUrl?: string;
  notionUrl?: string;
  createdAt?: string;
};

export type CardSource = "notion" | "mock";

export type BoardData = {
  customers: Customer[];
  source: CardSource;
  notionError?: string;
  fetchedAt: string;
};

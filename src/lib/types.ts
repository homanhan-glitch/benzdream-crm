export type StageId =
  | "first_contact"
  | "fu_1"
  | "fu_2"
  | "decision"
  | "contract"
  | "delivered"
  | "aftercare"
  | "long_touch"
  | "lost";

export type Heat = "hot" | "warm" | "cold" | "unknown";
export type Rank = "A" | "B" | "C" | "unknown";
export type Grade = "VIP" | "A" | "B" | "F" | "unknown";
export type SalesStatus = "잠재고객" | "계약고객" | "출고고객" | "이탈" | "";

export type DnState = {
  newD3?: boolean;
  newD7?: boolean;
  newD14?: boolean;
  newD30?: boolean;
  delivD1?: boolean;
  delivD7?: boolean;
  delivD30?: boolean;
  delivD180?: boolean;
  delivD365?: boolean;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  stage: StageId;
  stageRaw?: string;
  heat: Heat;
  rank: Rank;
  grade: Grade;
  salesStatus?: SalesStatus;
  vehicleClass?: string;
  vehicleInterest?: string;
  competitor?: string;
  budget?: string;
  criticalFactor?: string;
  notes?: string;
  source?: string;
  channel?: string;
  age?: string;
  gender?: string;
  buyMethod?: string;
  firstContact?: string;
  nextContact?: string;
  contractDate?: string;
  scheduledDelivery?: string;
  deliveredDate?: string;
  finalResult?: string;
  exteriorColor?: string;
  interiorColor?: string;
  carNumber?: string;
  deliveredModel?: string;
  notionUrl?: string;
  createdAt?: string;
  dn: DnState;
  logIds: string[];
  scheduleIds: string[];
};

export type CardSource = "notion" | "mock";

export type FetchResult = {
  customers: Customer[];
  source: CardSource;
  notionError?: string;
  totalFetched: number;
};

export type ConsultLog = {
  id: string;
  title: string;
  date?: string;
  url: string;
  preview?: string;
};

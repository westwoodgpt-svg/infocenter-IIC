export interface KpiCheckpoint {
  id: string;
  title: string;
  planValue: string;
  planDate: string;
  factValue: string;
  factDate?: string;
  percent: number | null;
}

export interface SubsidyProgram {
  title: string;
  agreement: string;
  year: number;
  items: KpiCheckpoint[];
}

export interface SmetaLine {
  title: string;
  agreement: string;
  year: number;
  plan: number;
  fact: number;
  asOf: string;
  responsible: string;
}

export interface EngagementPoint {
  year: string;
  seminarParticipants: number | null;
  supportRecipients: number | null;
}

export interface ResponsiblePerson {
  name: string;
  role: string;
  areas: string[];
  birthday?: string;
}

export interface TaskDisciplineStatus {
  periodicity: string;
  responsible: string;
  lastReviewed: string | null;
  causesInside: string[];
  causesOutside: string[];
}

export interface IicDashboardData {
  updated: string;
  kpiSoderzhanie: SubsidyProgram;
  kpiFinPodderzhka: SubsidyProgram;
  smety: SmetaLine[];
  engagement: EngagementPoint[];
  efficiencyFactors: string[];
  responsible: ResponsiblePerson[];
  taskDiscipline: TaskDisciplineStatus;
}

export type TabId = 'security' | 'quality' | 'production' | 'costs' | 'personnel';

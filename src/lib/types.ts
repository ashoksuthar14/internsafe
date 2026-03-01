export interface AgentState {
  id: string;
  name: string;
  pillar: "shield" | "fit" | "leverage" | "final";
  status: "waiting" | "running" | "completed" | "error" | "skipped";
  statusText: string;
  result: any | null;
  error: string | null;
  startedAt: number | null;
  completedAt: number | null;
}

export interface AnalysisState {
  currentStep: "input" | "profile" | "executing" | "report";
  agents: AgentState[];
  overallSafetyScore: number | null;
  overallFitScore: number | null;
  verdict: string | null;
  stoppedEarly: boolean;
  fullResults: any | null;
}

export type AgentAction =
  | { type: "START_AGENT"; agentId: string; statusText: string }
  | { type: "COMPLETE_AGENT"; agentId: string; result: any; summary: string }
  | { type: "FAIL_AGENT"; agentId: string; error: string }
  | { type: "SKIP_AGENTS"; agentIds: string[] }
  | { type: "COMPLETE_ANALYSIS"; safetyScore: number; fitScore: number; verdict: string; fullResults: any }
  | { type: "SET_STEP"; step: AnalysisState["currentStep"] }
  | { type: "RESET" };

export interface AnalysisInput {
  jobListingText: string;
  listingUrl?: string;
  resumeText: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface AnalysisRecord {
  id: string;
  user_id: string;
  job_listing_text: string;
  job_title: string | null;
  company_name: string | null;
  listing_url: string | null;
  resume_text: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  safety_score: number | null;
  fit_score: number | null;
  verdict: string | null;
  agent_results: any;
  created_at: string;
}

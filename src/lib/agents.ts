import { callGroqAgent } from "./groq";
import {
  LISTING_ANALYST_PROMPT,
  COMPANY_INVESTIGATOR_PROMPT,
  RECRUITER_VERIFIER_PROMPT,
  SAFETY_GATE_PROMPT,
  PROFILE_DEEPDIVE_PROMPT,
  FIT_MATCH_PROMPT,
  GROWTH_GAP_PROMPT,
  MARKET_INTEL_PROMPT,
  APP_STRATEGIST_PROMPT,
  NEGOTIATION_COACH_PROMPT,
} from "./agentPrompts";
import type { AgentAction, AnalysisInput } from "./types";

export const AGENT_DEFINITIONS = [
  { id: "listing-analyst", name: "Listing Analyst", pillar: "shield" as const },
  { id: "company-investigator", name: "Company Investigator", pillar: "shield" as const },
  { id: "recruiter-verifier", name: "Recruiter Verifier", pillar: "shield" as const },
  { id: "safety-gate", name: "Safety Gate", pillar: "shield" as const },
  { id: "profile-deepdive", name: "Profile Deep-Dive", pillar: "fit" as const },
  { id: "fit-match", name: "Fit-Match Engine", pillar: "fit" as const },
  { id: "growth-gap", name: "Growth-Gap Analyzer", pillar: "fit" as const },
  { id: "market-intel", name: "Market Intelligence", pillar: "leverage" as const },
  { id: "app-strategist", name: "Application Strategist", pillar: "leverage" as const },
  { id: "negotiation-coach", name: "Negotiation Coach", pillar: "leverage" as const },
  { id: "report-generator", name: "Report Generator", pillar: "final" as const },
];

export async function runAnalysisPipeline(
  input: AnalysisInput,
  apiKey: string,
  dispatch: (action: AgentAction) => void
) {
  const { jobListingText, resumeText } = input;

  const runAgent = async (
    id: string,
    statusText: string,
    prompt: string,
    content: string
  ) => {
    dispatch({ type: "START_AGENT", agentId: id, statusText });
    try {
      const result = await callGroqAgent(prompt, content, apiKey);
      dispatch({
        type: "COMPLETE_AGENT",
        agentId: id,
        result,
        summary: result.summary || "Analysis complete",
      });
      return result;
    } catch (err: any) {
      dispatch({ type: "FAIL_AGENT", agentId: id, error: err.message });
      throw err;
    }
  };

  // Stagger visual start
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // PILLAR 1: SHIELD
  const listingAnalysis = await runAgent(
    "listing-analyst",
    "Scanning listing for red flags...",
    LISTING_ANALYST_PROMPT,
    jobListingText
  );
  await delay(300);

  const companyInvestigation = await runAgent(
    "company-investigator",
    "Investigating company legitimacy...",
    COMPANY_INVESTIGATOR_PROMPT,
    jobListingText
  );
  await delay(300);

  const recruiterVerification = await runAgent(
    "recruiter-verifier",
    "Verifying recruiter identity...",
    RECRUITER_VERIFIER_PROMPT,
    jobListingText
  );
  await delay(300);

  const safetyGate = await runAgent(
    "safety-gate",
    "Computing safety verdict...",
    SAFETY_GATE_PROMPT,
    JSON.stringify({ listing_analysis: listingAnalysis, company_investigation: companyInvestigation, recruiter_verification: recruiterVerification })
  );

  if (!safetyGate.should_continue) {
    dispatch({
      type: "SKIP_AGENTS",
      agentIds: ["profile-deepdive", "fit-match", "growth-gap", "market-intel", "app-strategist", "negotiation-coach"],
    });

    // Still run report generator
    dispatch({ type: "START_AGENT", agentId: "report-generator", statusText: "Generating final report..." });
    await delay(500);
    const fullResults = {
      safety: { listingAnalysis, companyInvestigation, recruiterVerification, safetyGate },
      fit: null,
      leverage: null,
      verdict: safetyGate.verdict,
      stoppedEarly: true,
    };
    dispatch({ type: "COMPLETE_AGENT", agentId: "report-generator", result: fullResults, summary: "Report generated — listing flagged as unsafe" });
    dispatch({
      type: "COMPLETE_ANALYSIS",
      safetyScore: safetyGate.safety_score,
      fitScore: 0,
      verdict: safetyGate.verdict,
      fullResults,
    });
    return fullResults;
  }

  await delay(300);

  // PILLAR 2: FIT
  const profileAnalysis = await runAgent(
    "profile-deepdive",
    "Analyzing your profile...",
    PROFILE_DEEPDIVE_PROMPT,
    resumeText
  );
  await delay(300);

  const fitMatch = await runAgent(
    "fit-match",
    "Matching profile to role...",
    FIT_MATCH_PROMPT,
    JSON.stringify({ profile: profileAnalysis, listing: jobListingText })
  );
  await delay(300);

  const growthGap = await runAgent(
    "growth-gap",
    "Identifying skill gaps...",
    GROWTH_GAP_PROMPT,
    JSON.stringify({ profile: profileAnalysis, listing: jobListingText, fit: fitMatch })
  );
  await delay(300);

  // PILLAR 3: LEVERAGE
  const marketIntel = await runAgent(
    "market-intel",
    "Gathering market intelligence...",
    MARKET_INTEL_PROMPT,
    jobListingText
  );
  await delay(300);

  const appStrategy = await runAgent(
    "app-strategist",
    "Crafting application strategy...",
    APP_STRATEGIST_PROMPT,
    JSON.stringify({ profile: profileAnalysis, listing: jobListingText, fit: fitMatch })
  );
  await delay(300);

  const negotiation = await runAgent(
    "negotiation-coach",
    "Preparing negotiation strategy...",
    NEGOTIATION_COACH_PROMPT,
    JSON.stringify({ profile: profileAnalysis, listing: jobListingText, market: marketIntel })
  );

  await delay(300);

  // REPORT GENERATOR
  dispatch({ type: "START_AGENT", agentId: "report-generator", statusText: "Compiling intelligence report..." });
  await delay(800);

  const fullResults = {
    safety: { listingAnalysis, companyInvestigation, recruiterVerification, safetyGate },
    fit: { profileAnalysis, fitMatch, growthGap },
    leverage: { marketIntel, appStrategy, negotiation },
    verdict: safetyGate.verdict,
    stoppedEarly: false,
  };

  dispatch({ type: "COMPLETE_AGENT", agentId: "report-generator", result: fullResults, summary: "Intelligence report ready" });
  dispatch({
    type: "COMPLETE_ANALYSIS",
    safetyScore: safetyGate.safety_score,
    fitScore: fitMatch.overall_fit_score || 0,
    verdict: safetyGate.verdict,
    fullResults,
  });

  return fullResults;
}

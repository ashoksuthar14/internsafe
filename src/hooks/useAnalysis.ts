import { useReducer, useCallback } from "react";
import type { AnalysisState, AgentAction } from "@/lib/types";
import { AGENT_DEFINITIONS } from "@/lib/agents";

const initialAgents = AGENT_DEFINITIONS.map((d) => ({
  id: d.id,
  name: d.name,
  pillar: d.pillar,
  status: "waiting" as const,
  statusText: "",
  result: null,
  error: null,
  startedAt: null,
  completedAt: null,
}));

const initialState: AnalysisState = {
  currentStep: "input",
  agents: initialAgents,
  overallSafetyScore: null,
  overallFitScore: null,
  verdict: null,
  stoppedEarly: false,
  fullResults: null,
};

function reducer(state: AnalysisState, action: AgentAction): AnalysisState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "START_AGENT":
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.agentId
            ? { ...a, status: "running", statusText: action.statusText, startedAt: Date.now() }
            : a
        ),
      };
    case "COMPLETE_AGENT":
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.agentId
            ? { ...a, status: "completed", statusText: action.summary, result: action.result, completedAt: Date.now() }
            : a
        ),
      };
    case "FAIL_AGENT":
      return {
        ...state,
        agents: state.agents.map((a) =>
          a.id === action.agentId
            ? { ...a, status: "error", error: action.error, statusText: action.error }
            : a
        ),
      };
    case "SKIP_AGENTS":
      return {
        ...state,
        stoppedEarly: true,
        agents: state.agents.map((a) =>
          action.agentIds.includes(a.id)
            ? { ...a, status: "skipped", statusText: "Skipped — listing flagged as unsafe" }
            : a
        ),
      };
    case "COMPLETE_ANALYSIS":
      return {
        ...state,
        currentStep: "report",
        overallSafetyScore: action.safetyScore,
        overallFitScore: action.fitScore,
        verdict: action.verdict,
        fullResults: action.fullResults,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useAnalysis() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  return { state, dispatch, reset };
}

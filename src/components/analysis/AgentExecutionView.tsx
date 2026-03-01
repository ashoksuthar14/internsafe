import { Shield, Building2, UserCheck, ShieldAlert, Brain, Target, TrendingUp, BarChart3, FileEdit, HandCoins, FileOutput } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentState } from "@/lib/types";

const PILLAR_LABELS: Record<string, { label: string; color: string }> = {
  shield: { label: "SHIELD — Scam Detection", color: "text-destructive" },
  fit: { label: "FIT — Compatibility", color: "text-primary" },
  leverage: { label: "LEVERAGE — Strategy", color: "text-success" },
  final: { label: "FINAL", color: "text-info" },
};

const AGENT_ICONS: Record<string, any> = {
  "listing-analyst": Shield,
  "company-investigator": Building2,
  "recruiter-verifier": UserCheck,
  "safety-gate": ShieldAlert,
  "profile-deepdive": Brain,
  "fit-match": Target,
  "growth-gap": TrendingUp,
  "market-intel": BarChart3,
  "app-strategist": FileEdit,
  "negotiation-coach": HandCoins,
  "report-generator": FileOutput,
};

interface AgentCardProps {
  agent: AgentState;
}

export function AgentCard({ agent }: AgentCardProps) {
  const Icon = AGENT_ICONS[agent.id] || Shield;
  
  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all duration-300",
        agent.status === "waiting" && "border-border bg-card/50 opacity-60",
        agent.status === "running" && "border-primary bg-primary/5",
        agent.status === "completed" && "border-success/50 bg-success/5",
        agent.status === "error" && "border-destructive/50 bg-destructive/5",
        agent.status === "skipped" && "border-border bg-card/30 opacity-40"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn(
          "h-5 w-5 shrink-0",
          agent.status === "waiting" && "text-muted-foreground",
          agent.status === "running" && "text-primary animate-pulse-slow",
          agent.status === "completed" && "text-success",
          agent.status === "error" && "text-destructive",
          agent.status === "skipped" && "text-muted-foreground"
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm">{agent.name}</span>
            <StatusBadge status={agent.status} />
          </div>
          {agent.statusText && (
            <p className={cn(
              "text-xs mt-1 truncate",
              agent.status === "running" ? "text-primary" : "text-muted-foreground"
            )}>
              {agent.statusText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AgentState["status"] }) {
  const config = {
    waiting: { label: "Waiting", className: "bg-secondary text-muted-foreground" },
    running: { label: "Running...", className: "bg-primary/20 text-primary animate-pulse-slow" },
    completed: { label: "✓ Done", className: "bg-success/20 text-success" },
    error: { label: "✗ Error", className: "bg-destructive/20 text-destructive" },
    skipped: { label: "Skipped", className: "bg-secondary text-muted-foreground" },
  }[status];

  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap", config.className)}>
      {config.label}
    </span>
  );
}

export function AgentExecutionView({ agents }: { agents: AgentState[] }) {
  const pillars = ["shield", "fit", "leverage", "final"];

  return (
    <div className="space-y-6 animate-fade-in">
      {pillars.map((pillar) => {
        const pillarAgents = agents.filter((a) => a.pillar === pillar);
        if (pillarAgents.length === 0) return null;
        const info = PILLAR_LABELS[pillar];
        return (
          <div key={pillar}>
            <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-3", info.color)}>
              {info.label}
            </h3>
            <div className="space-y-2">
              {pillarAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AgentExecutionView } from "@/components/analysis/AgentExecutionView";
import { useAnalysis } from "@/hooks/useAnalysis";
import { runAnalysisPipeline } from "@/lib/agents";
import { getApiKey } from "@/lib/groq";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

const NewAnalysis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, dispatch, reset } = useAnalysis();

  // Step 1 state
  const [jobListing, setJobListing] = useState("");
  const [listingUrl, setListingUrl] = useState("");

  // Step 2 state
  const [resumeText, setResumeText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const handleStep1Next = () => {
    if (!jobListing.trim()) {
      toast.error("Please paste a job listing");
      return;
    }
    dispatch({ type: "SET_STEP", step: "profile" });
  };

  const handleRunAnalysis = async () => {
    if (!resumeText.trim()) {
      toast.error("Please paste your resume text");
      return;
    }
    const apiKey = getApiKey();
    if (!apiKey) {
      toast.error("Please add your Groq API key in Settings first");
      navigate("/settings");
      return;
    }

    dispatch({ type: "SET_STEP", step: "executing" });

    try {
      const results = await runAnalysisPipeline(
        { jobListingText: jobListing, listingUrl, resumeText, linkedinUrl, githubUrl },
        apiKey,
        dispatch
      );

      // Save to database
      if (user) {
        const { data, error } = await supabase.from("analyses").insert({
          user_id: user.id,
          job_listing_text: jobListing,
          job_title: results.safety?.companyInvestigation?.company_name ? `Role at ${results.safety.companyInvestigation.company_name}` : "Analysis",
          company_name: results.safety?.companyInvestigation?.company_name || null,
          listing_url: listingUrl || null,
          resume_text: resumeText,
          linkedin_url: linkedinUrl || null,
          github_url: githubUrl || null,
          safety_score: results.safety?.safetyGate?.safety_score || null,
          fit_score: results.fit?.fitMatch?.overall_fit_score || null,
          verdict: results.verdict,
          agent_results: results,
        } as any).select().single();

        if (data) {
          toast.success("Analysis saved!");
        }
        if (error) console.error("Save error:", error);
      }
    } catch (err: any) {
      toast.error("Analysis pipeline error: " + err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto animate-fade-in">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {["Input", "Profile", "Agents", "Report"].map((label, i) => {
            const steps = ["input", "profile", "executing", "report"];
            const active = steps.indexOf(state.currentStep) >= i;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                  active ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 3 && <div className={`w-8 h-px ${active ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Job Listing */}
        {state.currentStep === "input" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Paste the Job Listing</h2>
              <p className="text-muted-foreground">Paste the full job description, WhatsApp forward, or any text about the opportunity.</p>
            </div>
            <div>
              <Label>Job Listing Text *</Label>
              <Textarea
                value={jobListing}
                onChange={(e) => setJobListing(e.target.value)}
                placeholder="Paste the job listing here..."
                className="mt-1.5 min-h-[200px] bg-secondary border-border"
              />
            </div>
            <div>
              <Label>Listing URL (optional)</Label>
              <Input
                value={listingUrl}
                onChange={(e) => setListingUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1.5 bg-secondary border-border"
              />
            </div>
            <Button onClick={handleStep1Next} className="w-full">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Profile */}
        {state.currentStep === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
              <p className="text-muted-foreground">Paste your resume text for the best analysis results.</p>
            </div>
            <div>
              <Label>Resume Text *</Label>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Copy-paste your resume text here for best results..."
                className="mt-1.5 min-h-[200px] bg-secondary border-border"
              />
            </div>
            <div>
              <Label>LinkedIn URL (optional)</Label>
              <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className="mt-1.5 bg-secondary border-border" />
            </div>
            <div>
              <Label>GitHub URL (optional)</Label>
              <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="mt-1.5 bg-secondary border-border" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => dispatch({ type: "SET_STEP", step: "input" })} className="flex-1">Back</Button>
              <Button onClick={handleRunAnalysis} className="flex-1 glow-primary">
                <Loader2 className="mr-2 h-4 w-4 hidden" /> Run Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Agent Execution */}
        {state.currentStep === "executing" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Agents Working...</h2>
              <p className="text-muted-foreground">Our AI agents are analyzing the listing and your profile in real-time.</p>
            </div>
            <AgentExecutionView agents={state.agents} />
          </div>
        )}

        {/* Step 4: Report */}
        {state.currentStep === "report" && state.fullResults && (
          <ReportView
            results={state.fullResults}
            safetyScore={state.overallSafetyScore || 0}
            fitScore={state.overallFitScore || 0}
            verdict={state.verdict || ""}
            onNewAnalysis={() => {
              reset();
              setJobListing("");
              setResumeText("");
              setListingUrl("");
              setLinkedinUrl("");
              setGithubUrl("");
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

function ScoreCircle({ score, label, size = 80 }: { score: number; label: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score > 70 ? "text-success" : score > 40 ? "text-warning" : "text-destructive";
  const strokeColor = score > 70 ? "hsl(var(--success))" : score > 40 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={4} fill="none" stroke="hsl(var(--border))" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} strokeWidth={4} fill="none"
            stroke={strokeColor}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-lg ${color}`}>
          {score}
        </span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

function ReportView({
  results,
  safetyScore,
  fitScore,
  verdict,
  onNewAnalysis,
}: {
  results: any;
  safetyScore: number;
  fitScore: number;
  verdict: string;
  onNewAnalysis: () => void;
}) {
  const companyName = results.safety?.companyInvestigation?.company_name || "Unknown";
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Intelligence Report</h2>
        <p className="text-muted-foreground">{companyName} &middot; {new Date().toLocaleDateString()}</p>
      </div>

      {/* Scores */}
      <div className="flex justify-center gap-8 flex-wrap">
        <ScoreCircle score={safetyScore} label="Safety Score" />
        {fitScore > 0 && <ScoreCircle score={fitScore} label="Fit Score" />}
        <div className="flex flex-col items-center gap-2 justify-center">
          <span className={`text-2xl font-bold px-4 py-2 rounded-lg ${
            verdict === "SAFE" ? "bg-success/20 text-success" :
            verdict === "CAUTION" ? "bg-warning/20 text-warning" :
            "bg-destructive/20 text-destructive"
          }`}>
            {verdict}
          </span>
          <span className="text-xs text-muted-foreground">Verdict</span>
        </div>
      </div>

      {/* Safety Section */}
      <Section title="🛡️ Safety Analysis">
        <p className="text-muted-foreground mb-3">{results.safety?.safetyGate?.evidence_summary}</p>
        {results.safety?.listingAnalysis?.red_flags?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold">Red Flags</h4>
            {results.safety.listingAnalysis.red_flags.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 ${
                  f.severity === "high" ? "bg-destructive/20 text-destructive" :
                  f.severity === "medium" ? "bg-warning/20 text-warning" :
                  "bg-info/20 text-info"
                }`}>{f.severity}</span>
                <span className="text-muted-foreground">{f.flag}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Fit Section */}
      {results.fit && (
        <Section title="🎯 Fit Analysis">
          <p className="text-muted-foreground mb-4">{results.fit.fitMatch?.summary}</p>
          <div className="space-y-3">
            {results.fit.fitMatch?.dimensions && Object.entries(results.fit.fitMatch.dimensions).map(([key, dim]: [string, any]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="font-mono font-bold">{dim.score}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      dim.score > 70 ? "bg-success" : dim.score > 40 ? "bg-warning" : "bg-destructive"
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{dim.detail}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Upskilling */}
      {results.fit?.growthGap?.critical_gaps?.length > 0 && (
        <Section title="📈 Upskilling Roadmap">
          <p className="text-muted-foreground mb-3 text-sm">
            Total time: {results.fit.growthGap.total_upskilling_time} &middot; Projected fit after: {results.fit.growthGap.projected_fit_after_upskilling}%
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2">Skill</th><th className="pb-2">Current</th><th className="pb-2">Needed</th><th className="pb-2">Time</th><th className="pb-2">Resource</th>
                </tr>
              </thead>
              <tbody>
                {results.fit.growthGap.critical_gaps.map((g: any, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 font-medium">{g.skill}</td>
                    <td className="py-2 text-muted-foreground">{g.current_level}</td>
                    <td className="py-2 text-muted-foreground">{g.needed_level}</td>
                    <td className="py-2 text-muted-foreground">{g.time_to_close}</td>
                    <td className="py-2 text-muted-foreground">{g.recommended_resource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Strategy */}
      {results.leverage?.appStrategy && (
        <Section title="📝 Application Strategy">
          {results.leverage.appStrategy.resume_improvements?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">Resume Improvements</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {results.leverage.appStrategy.resume_improvements.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {results.leverage.appStrategy.cover_letter && (
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">Cover Letter Draft</h4>
              <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono text-xs">
                {results.leverage.appStrategy.cover_letter}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Negotiation */}
      {results.leverage?.negotiation && (
        <Section title="💰 Negotiation Strategy">
          <p className="text-muted-foreground text-sm mb-3">{results.leverage.negotiation.offered_vs_market}</p>
          {results.leverage.negotiation.negotiation_script && (
            <div>
              <h4 className="text-sm font-bold mb-2">Ready-to-Send Script</h4>
              <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono text-xs">
                {results.leverage.negotiation.negotiation_script}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={() => window.print()} className="flex-1">Download PDF</Button>
        <Button onClick={onNewAnalysis} className="flex-1">New Analysis</Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default NewAnalysis;

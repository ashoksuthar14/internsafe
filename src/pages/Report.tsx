import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Report = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setReport(data);
        setLoading(false);
      });
  }, [user, id]);

  if (loading) return <DashboardLayout><div className="p-10 text-muted-foreground">Loading...</div></DashboardLayout>;
  if (!report) return <DashboardLayout><div className="p-10 text-muted-foreground">Report not found.</div></DashboardLayout>;

  const results = report.agent_results;
  const safetyScore = report.safety_score || 0;
  const fitScore = report.fit_score || 0;
  const verdict = report.verdict || "";

  const scoreColor = (s: number) => s > 70 ? "text-success" : s > 40 ? "text-warning" : "text-destructive";

  const reportToScamDb = async () => {
    const { error } = await supabase.from("scam_reports").insert({
      analysis_id: report.id,
      reported_by: user!.id,
      company_name: report.company_name,
      listing_snippet: report.job_listing_text?.slice(0, 300),
      red_flags: results?.safety?.listingAnalysis?.red_flags?.map((f: any) => f.flag) || [],
      safety_score: safetyScore,
    } as any);
    if (error) toast.error("Failed to report");
    else toast.success("Reported to Scam Database");
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-3xl mx-auto animate-fade-in space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{report.job_title || "Intelligence Report"}</h1>
          <p className="text-muted-foreground">{report.company_name} &middot; {new Date(report.created_at).toLocaleDateString()}</p>
        </div>

        {/* Scores */}
        <div className="flex justify-center gap-6 flex-wrap">
          <div className="text-center">
            <div className={`text-4xl font-mono font-bold ${scoreColor(safetyScore)}`}>{safetyScore}%</div>
            <div className="text-xs text-muted-foreground mt-1">Safety</div>
          </div>
          {fitScore > 0 && (
            <div className="text-center">
              <div className={`text-4xl font-mono font-bold ${scoreColor(fitScore)}`}>{fitScore}%</div>
              <div className="text-xs text-muted-foreground mt-1">Fit</div>
            </div>
          )}
          <div className="text-center">
            <span className={`text-2xl font-bold px-4 py-2 rounded-lg inline-block ${
              verdict === "SAFE" ? "bg-success/20 text-success" :
              verdict === "CAUTION" ? "bg-warning/20 text-warning" :
              "bg-destructive/20 text-destructive"
            }`}>{verdict}</span>
            <div className="text-xs text-muted-foreground mt-1">Verdict</div>
          </div>
        </div>

        {/* Safety */}
        {results?.safety?.safetyGate && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold mb-3">🛡️ Safety Analysis</h3>
            <p className="text-muted-foreground text-sm mb-3">{results.safety.safetyGate.evidence_summary}</p>
            {results.safety.listingAnalysis?.red_flags?.map((f: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm mb-1">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  f.severity === "high" ? "bg-destructive/20 text-destructive" :
                  f.severity === "medium" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"
                }`}>{f.severity}</span>
                <span className="text-muted-foreground">{f.flag}</span>
              </div>
            ))}
          </div>
        )}

        {/* Fit */}
        {results?.fit?.fitMatch && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold mb-3">🎯 Fit Analysis</h3>
            <p className="text-muted-foreground text-sm mb-4">{results.fit.fitMatch.summary}</p>
            {results.fit.fitMatch.dimensions && Object.entries(results.fit.fitMatch.dimensions).map(([key, dim]: [string, any]) => (
              <div key={key} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="font-mono font-bold">{dim.score}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${dim.score > 70 ? "bg-success" : dim.score > 40 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${dim.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Strategy */}
        {results?.leverage?.appStrategy?.cover_letter && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold mb-3">📝 Cover Letter</h3>
            <div className="bg-secondary rounded-lg p-4 text-sm text-muted-foreground whitespace-pre-wrap font-mono text-xs">
              {results.leverage.appStrategy.cover_letter}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()} className="flex-1">Download PDF</Button>
          <Button variant="outline" onClick={reportToScamDb} className="flex-1">Report to Scam DB</Button>
          <Button onClick={() => navigate("/analysis/new")} className="flex-1">New Analysis</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Report;

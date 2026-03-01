import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Shield, Target, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, scams: 0, avgFit: 0 });
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        setRecentReports(data);
        const scams = data.filter((d) => d.verdict === "LIKELY_SCAM").length;
        const fits = data.filter((d) => d.fit_score != null);
        const avgFit = fits.length ? Math.round(fits.reduce((s, d) => s + (d.fit_score || 0), 0) / fits.length) : 0;
        // Get total count
        const { count } = await supabase.from("analyses").select("*", { count: "exact", head: true }).eq("user_id", user.id);
        setStats({ total: count || 0, scams, avgFit });
      }
    };
    fetchData();
  }, [user]);

  const fullName = user?.user_metadata?.full_name || "there";

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in">
        {/* Welcome */}
        <div className="rounded-xl border border-border bg-card p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {fullName} 👋</h1>
          <p className="text-muted-foreground">Start a new analysis or view your past reports.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: FileText, label: "Total Analyses", value: stats.total, color: "text-info" },
            { icon: Shield, label: "Scams Detected", value: stats.scams, color: "text-destructive" },
            { icon: Target, label: "Avg Fit Score", value: `${stats.avgFit}%`, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-6">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <div className="text-2xl font-bold font-mono">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button size="lg" className="w-full mb-8 py-6 text-lg glow-primary" onClick={() => navigate("/analysis/new")}>
          <Plus className="mr-2 h-5 w-5" /> New Analysis
        </Button>

        {/* Recent */}
        {recentReports.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Recent Reports</h2>
            <div className="space-y-3">
              {recentReports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/analysis/${r.id}`)}
                  className="w-full text-left rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{r.job_title || "Untitled"}</div>
                    <div className="text-sm text-muted-foreground">{r.company_name || "Unknown company"} &middot; {new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.safety_score != null && (
                      <span className={`text-sm font-mono font-bold ${r.safety_score > 70 ? "text-success" : r.safety_score > 40 ? "text-warning" : "text-destructive"}`}>
                        {r.safety_score}%
                      </span>
                    )}
                    {r.verdict && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        r.verdict === "SAFE" ? "bg-success/20 text-success" :
                        r.verdict === "CAUTION" ? "bg-warning/20 text-warning" :
                        "bg-destructive/20 text-destructive"
                      }`}>
                        {r.verdict}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

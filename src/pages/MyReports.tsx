import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const MyReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [user]);

  const deleteReport = async (id: string) => {
    await supabase.from("analyses").delete().eq("id", id);
    toast.success("Report deleted");
    fetchReports();
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">My Reports</h1>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="mb-4">No reports yet. Run your first analysis!</p>
            <Button onClick={() => navigate("/analysis/new")}>New Analysis</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-card p-5 flex items-center justify-between hover:border-primary/30 transition-colors"
              >
                <button onClick={() => navigate(`/analysis/${r.id}`)} className="text-left flex-1">
                  <div className="font-medium">{r.job_title || "Untitled"}</div>
                  <div className="text-sm text-muted-foreground">
                    {r.company_name || "Unknown"} &middot; {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </button>
                <div className="flex items-center gap-3">
                  {r.safety_score != null && (
                    <span className={`font-mono font-bold text-sm ${r.safety_score > 70 ? "text-success" : r.safety_score > 40 ? "text-warning" : "text-destructive"}`}>
                      {r.safety_score}%
                    </span>
                  )}
                  {r.verdict && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      r.verdict === "SAFE" ? "bg-success/20 text-success" :
                      r.verdict === "CAUTION" ? "bg-warning/20 text-warning" :
                      "bg-destructive/20 text-destructive"
                    }`}>{r.verdict}</span>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteReport(r.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyReports;

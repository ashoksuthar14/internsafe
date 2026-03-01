import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const ScamDatabase = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("scam_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setReports(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = reports.filter(
    (r) =>
      (r.company_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.listing_snippet || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">Scam Database</h1>
        <p className="text-muted-foreground mb-6">Crowdsourced reports from the community.</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or keyword..."
            className="pl-10 bg-secondary border-border"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No scam reports yet.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium">{r.company_name || "Unknown Company"}</div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.listing_snippet}</p>
                    {r.red_flags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.red_flags.map((flag: string, i: number) => (
                          <span key={i} className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {r.safety_score != null && (
                      <div className={`font-mono font-bold ${r.safety_score > 70 ? "text-success" : r.safety_score > 40 ? "text-warning" : "text-destructive"}`}>
                        {r.safety_score}%
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScamDatabase;

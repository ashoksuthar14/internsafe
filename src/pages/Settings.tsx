import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getApiKey, setApiKey, testApiKey } from "@/lib/groq";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { user } = useAuth();
  const [groqKey, setGroqKey] = useState(getApiKey() || "");
  const [keyStatus, setKeyStatus] = useState<"idle" | "testing" | "valid" | "invalid">("idle");
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [defaultResume, setDefaultResume] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setFullName(data.full_name || "");
        setCollege(data.college || "");
        setDefaultResume(data.default_resume_text || "");
      }
    });
  }, [user]);

  const handleTestKey = async () => {
    setKeyStatus("testing");
    const valid = await testApiKey(groqKey);
    setKeyStatus(valid ? "valid" : "invalid");
    if (valid) {
      setApiKey(groqKey);
      toast.success("API key is valid!");
    } else {
      toast.error("Invalid API key");
    }
  };

  const handleSaveKey = () => {
    setApiKey(groqKey);
    toast.success("API key saved");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName,
      college,
      default_resume_text: defaultResume,
    } as any).eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Profile saved");
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 max-w-2xl mx-auto animate-fade-in space-y-8">
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Groq API Key */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-4">Groq API Key</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your Groq API key to power the AI agents. Get one at{" "}
            <a href="https://console.groq.com" target="_blank" rel="noopener" className="text-primary hover:underline">console.groq.com</a>
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              value={groqKey}
              onChange={(e) => { setGroqKey(e.target.value); setKeyStatus("idle"); }}
              placeholder="gsk_..."
              className="bg-secondary border-border"
            />
            <Button variant="outline" onClick={handleTestKey} disabled={!groqKey || keyStatus === "testing"}>
              {keyStatus === "testing" ? <Loader2 className="h-4 w-4 animate-spin" /> :
               keyStatus === "valid" ? <CheckCircle className="h-4 w-4 text-success" /> :
               keyStatus === "invalid" ? <XCircle className="h-4 w-4 text-destructive" /> :
               "Test"}
            </Button>
            <Button onClick={handleSaveKey} disabled={!groqKey}>Save</Button>
          </div>
        </div>

        {/* Profile */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold">Profile</h2>
          <div>
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="mt-1.5 bg-secondary border-border opacity-60" />
          </div>
          <div>
            <Label>College</Label>
            <Input value={college} onChange={(e) => setCollege(e.target.value)} className="mt-1.5 bg-secondary border-border" />
          </div>
          <div>
            <Label>Default Resume Text</Label>
            <Textarea
              value={defaultResume}
              onChange={(e) => setDefaultResume(e.target.value)}
              placeholder="Paste your default resume here..."
              className="mt-1.5 min-h-[150px] bg-secondary border-border"
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

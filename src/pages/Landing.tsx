import { Shield, Target, TrendingUp, ArrowRight, AlertTriangle, Users, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">InternSafe 2.0</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
          <Button onClick={() => navigate("/signup")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 md:py-36 text-center max-w-4xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
          <Shield className="h-4 w-4" />
          AI-Powered Career Intelligence
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          <span className="text-gradient">InternSafe</span>{" "}
          <span className="text-foreground">2.0</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Protecting Students. Empowering Careers.{" "}
          <span className="text-foreground font-medium">Powered by AI.</span>
        </p>
        <Button
          size="lg"
          className="text-lg px-8 py-6 glow-primary"
          onClick={() => navigate("/signup")}
        >
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Shield",
              subtitle: "Scam Detection",
              desc: "Multi-agent AI analyzes listings for fraud signals, fake companies, and suspicious recruiter patterns.",
              color: "text-destructive",
            },
            {
              icon: Target,
              title: "Fit",
              subtitle: "Compatibility Analysis",
              desc: "Deep profile analysis matched against role requirements across 5 dimensions of fit.",
              color: "text-primary",
            },
            {
              icon: TrendingUp,
              title: "Leverage",
              subtitle: "Career Strategy",
              desc: "Market intelligence, application optimization, and negotiation coaching powered by AI.",
              color: "text-success",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-8 card-shadow hover:border-primary/30 transition-colors"
            >
              <f.icon className={`h-10 w-10 ${f.color} mb-5`} />
              <h3 className="text-2xl font-bold mb-1">{f.title}</h3>
              <p className="text-primary text-sm font-medium mb-3">{f.subtitle}</p>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-20 border-t border-border/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Users, stat: "10M+", label: "Students search for internships annually" },
            { icon: AlertTriangle, stat: "50K+", label: "Scammed by fake listings every year" },
            { icon: HandCoins, stat: "70%", label: "Accept offers without negotiating" },
          ].map((s) => (
            <div key={s.stat} className="flex flex-col items-center gap-3">
              <s.icon className="h-8 w-8 text-muted-foreground" />
              <span className="text-4xl font-black text-gradient">{s.stat}</span>
              <span className="text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8 text-center text-muted-foreground text-sm">
        Built for AMD Slingshot Hackathon &middot; InternSafe 2.0
      </footer>
    </div>
  );
};

export default Landing;

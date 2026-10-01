import { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

// Modular marketing pages
import HomePage from "./pages/HomePage";
import FeaturesPage from "./pages/FeaturesPage";
import DemoPage from "./pages/DemoPage";
import PipelinePage from "./pages/PipelinePage";
import PricingPage from "./pages/PricingPage";
import FaqPage from "./pages/FaqPage";

// App & Auth components
import LoginPage from "./LoginPage";
import LeadsShell from "./LeadsShell";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const devBypass = window.location.hash.includes("#dev");

    if (devBypass) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSession(session);
          setCheckingAuth(false);
          return;
        }
        supabase.auth
          .signInWithPassword({
            email: "dev@langratia.local",
            password: "dev-langratia-admin",
          })
          .then(({ data, error }) => {
            if (error) {
              setSession({ user: { email: "dev@langratia.local" } } as any);
            } else {
              setSession(data.session);
            }
            setCheckingAuth(false);
          });
      });
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("leads_auth_token");
    await supabase.auth.signOut();
    setSession(null);
    setLocation("/");
  };

  const handleLoginSuccess = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession || { user: { email: "sales@langratia.com" } });
    setLocation("/app");
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-sky-400" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Initializing Langratia Leads…
          </p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* 1. Overview / Home Page */}
      <Route path="/">
        <HomePage session={session} onLogout={handleLogout} />
      </Route>

      {/* 2. Features Page */}
      <Route path="/features">
        <FeaturesPage session={session} onLogout={handleLogout} />
      </Route>

      {/* 3. Interactive Live Demo Page */}
      <Route path="/demo">
        <DemoPage session={session} onLogout={handleLogout} />
      </Route>

      {/* 4. Deal Pipeline & Workflow Page */}
      <Route path="/pipeline">
        <PipelinePage session={session} onLogout={handleLogout} />
      </Route>

      {/* 5. Pricing & Plans Page */}
      <Route path="/pricing">
        <PricingPage session={session} onLogout={handleLogout} />
      </Route>

      {/* 6. FAQ Page */}
      <Route path="/faq">
        <FaqPage session={session} onLogout={handleLogout} />
      </Route>

      {/* Staff Login Portal */}
      <Route path="/login">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      {/* Authenticated CRM OS */}
      <Route path="/app">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/crm">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/leads">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      {/* Fallback to Home Page */}
      <Route>
        <HomePage session={session} onLogout={handleLogout} />
      </Route>
    </Switch>
  );
}

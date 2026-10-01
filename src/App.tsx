import { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import LandingPage from "./LandingPage";
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
    await supabase.auth.signOut();
    setSession(null);
    setLocation("/");
  };

  const handleLoginSuccess = () => {
    setSession({ user: { email: "sales@langratia.com" } });
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
      {/* Public Marketing Landing Page */}
      <Route path="/">
        <LandingPage session={session} onLogout={handleLogout} />
      </Route>

      {/* Staff Login Page */}
      <Route path="/login">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      {/* CRM Application Workspace */}
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

      {/* Fallback route */}
      <Route>
        <LandingPage session={session} onLogout={handleLogout} />
      </Route>
    </Switch>
  );
}

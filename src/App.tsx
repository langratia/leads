import { config } from "@/config";
import { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { api } from "@/core/api";

// Modular marketing pages
import HomePage from "@/marketing/pages/HomePage";
import FeaturesPage from "@/marketing/pages/FeaturesPage";
import DemoPage from "@/marketing/pages/DemoPage";
import PipelinePage from "@/marketing/pages/PipelinePage";
import PricingPage from "@/marketing/pages/PricingPage";
import FaqPage from "@/marketing/pages/FaqPage";

// App & Auth components
import LoginPage from "@/crm/auth/LoginPage";
import LeadsShell from "@/crm/shell/LeadsShell";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    api.auth.getSession().then((sess) => {
      setSession(sess);
      setCheckingAuth(false);
    });
  }, []);

  const handleLogout = async () => {
    await api.auth.logout();
    setSession(null);
    setLocation("/");
  };

  const handleLoginSuccess = async () => {
    const currentSession = await api.auth.getSession();
    setSession(currentSession || { user: { email: config.defaultUserEmail } });
    setLocation("/app");
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-sky-400" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Initializing {config.brandName} {config.productName}…
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

      {/* Authenticated CRM OS Routes */}
      <Route path="/app/:rest*">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/crm/:rest*">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/admin/:rest*">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/admin">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

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

      <Route path="/agent">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/emails">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/customers">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/finder">
        {session ? (
          <LeadsShell userEmail={session.user?.email} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </Route>

      <Route path="/inquiries">
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

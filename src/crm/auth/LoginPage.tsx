import { config } from "@/config";
import { useState, useEffect } from "react";
import { api } from "@/core/api";
import { Lock, Mail, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.auth.getSession().then((session) => {
      if (session) {
        onLoginSuccess();
      }
    });
  }, [onLoginSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!authEmail || !authPassword) return;

    setLoading(true);
    try {
      const data = await api.auth.login(authEmail, authPassword);
      if (data.success) {
        onLoginSuccess();
      } else {
        setAuthError(data.error || "Invalid credentials. Access denied.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {config.brandName} {config.productName}
          </a>
        </div>

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-300 text-xl font-black text-black shadow-lg shadow-sky-500/20">
            L
          </span>
          <h1 className="mt-4 text-xl font-bold text-white tracking-tight">{config.brandFullName}</h1>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">
            Leads CRM &amp; Discovery Engine
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-white">Sign in to continue</h2>
            <p className="mt-1 text-xs text-slate-400">
              Staff sales access only.
            </p>
          </div>

          {authError && (
            <div className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-center text-xs font-semibold text-rose-400">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Staff email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder={config.defaultUserEmail}
                  className="w-full rounded-lg border border-slate-800 bg-black py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-black py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-sky-500 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  Authenticating…
                </>
              ) : (
                <>
                  Enter CRM <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-800/80 pt-5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Internal sales operating system.
          </div>
        </div>
      </div>
    </div>
  );
}

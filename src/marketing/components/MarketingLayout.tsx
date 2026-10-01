import { ReactNode } from "react";
import MarketingNavbar from "./MarketingNavbar";
import MarketingFooter from "./MarketingFooter";
import TopLoadingBar from "./TopLoadingBar";

interface MarketingLayoutProps {
  children: ReactNode;
  session?: any;
  onLogout?: () => void;
}

export default function MarketingLayout({
  children,
  session,
  onLogout,
}: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* YOUTUBE-STYLE TOP HORIZONTAL LOADING BAR */}
      <TopLoadingBar />

      {/* BACKGROUND GRADIENT MESH */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-sky-500/15 via-indigo-500/10 to-transparent blur-[120px] opacity-70" />
        <div className="absolute top-[40%] -left-48 w-[600px] h-[600px] bg-sky-600/10 blur-[140px] opacity-50" />
        <div className="absolute top-[70%] -right-48 w-[600px] h-[600px] bg-indigo-600/10 blur-[140px] opacity-40" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* STICKY TOP NAVBAR */}
      <MarketingNavbar session={session} onLogout={onLogout} />

      {/* PAGE BODY */}
      <main className="relative z-10">{children}</main>

      {/* FOOTER */}
      <MarketingFooter />
    </div>
  );
}

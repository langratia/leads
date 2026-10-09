"use client";

import { useState } from "react";
import {
  Shield,
  Zap,
  Target,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Award,
  RefreshCw,
  X,
  Building,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface SectorPreset {
  id: string;
  name: string;
  icon: string;
  typicalTicket: string;
  objections: {
    title: string;
    prospectQuote: string;
    objectionCategory: "Price & Budget" | "Vendor Trust" | "In-House IT" | "Staff Hesitation" | "Payment Terms";
    rootFear: string;
    counterStrategy: {
      step1Validate: string;
      step2Reframe: string;
      step3Hook: string;
    };
    winningScript: string;
    voiceNoteHook: string;
  }[];
}

const SECTOR_DRILLS: SectorPreset[] = [
  {
    id: "healthcare",
    name: "Medical Clinics & Hospitals",
    icon: "🏥",
    typicalTicket: "UGX 4.5M - 12M",
    objections: [
      {
        title: "The Budget Freeze / Tight Economy",
        prospectQuote: "Bambi, medical supplies and fuel have gone up; our budget is completely frozen for new software this quarter.",
        objectionCategory: "Price & Budget",
        rootFear: "Fear of unrecoverable cash outflow during tight operational cashflow.",
        counterStrategy: {
          step1Validate: "Acknowledge the heavy operating expenses facing private healthcare in Uganda today.",
          step2Reframe: "Highlight that patient no-shows and untracked pharmacy stock leakage cost an average Kampala clinic UGX 1.8M every month.",
          step3Hook: "Offer a phased milestone rollout: deploy the automated WhatsApp appointment reminder engine first with a 30% Mobile Money deposit.",
        },
        winningScript: "Doctor, I completely understand — healthcare operating overheads in Kampala have increased significantly. That is precisely why our clients in healthcare adopted LANGRATIA. Without automation, the average 30-bed clinic loses between UGX 1.5M to UGX 2.2M monthly in medication inventory slippage and missed appointments. Our system doesn't add a cost; it recovers lost revenue within 45 days. Why don't we start with our automated WhatsApp patient reminder module with an initial 30% deposit? If no-shows don't drop by at least 35% in month one, we pause phase two.",
        voiceNoteHook: "Hello Doctor, hope rounds went well today. Just reflecting on your point regarding tight operating budgets — completely valid. We actually structured a pilot milestone specifically for clinics that cuts no-shows and pays for itself within 4 weeks. I can share a 2-minute voice walkthrough if open.",
      },
      {
        title: "Staff Resistance & Paper Habit",
        prospectQuote: "Our nurses and records clerks only know how to write in physical patient books; they will resist using a computer.",
        objectionCategory: "Staff Hesitation",
        rootFear: "Fear of staff slowing down triage queues or staging resistance.",
        counterStrategy: {
          step1Validate: "Agree that clinical staff are busy and have zero tolerance for complicated software.",
          step2Reframe: "LANGRATIA operates on mobile WhatsApp bots and 1-tap tablet screens — no typing or IT training required.",
          step3Hook: "Offer a 2-hour on-site clinical staff simulation with physical presence.",
        },
        winningScript: "Sister / Doctor, you are 100% right. If a system takes 5 minutes to enter a triage note, nurses will rightfully abandon it. That's why LANGRATIA was engineered mobile-first: records clerks can look up a patient or dispense medicine with 3 taps on a mobile screen, or even via WhatsApp. We conduct hands-on training on-site in under 2 hours, and run parallel with your paper registers until your team is 100% confident.",
        voiceNoteHook: "Good afternoon Sister, understood on the staff paper routine. We designed LANGRATIA so nurses don't type — it uses 3-tap mobile cards just like WhatsApp. Let me demonstrate it to your records head in 15 minutes.",
      },
    ],
  },
  {
    id: "education",
    name: "Schools & Educational Institutes",
    icon: "🎓",
    typicalTicket: "UGX 6M - 18M",
    objections: [
      {
        title: "Vendor Abandonment Mistrust",
        prospectQuote: "We paid a software firm in Ntinda 8 million UGX two years ago; they delivered half a portal and vanished when term started.",
        objectionCategory: "Vendor Trust",
        rootFear: "Past trauma from unreliable fly-by-night IT developers.",
        counterStrategy: {
          step1Validate: "Acknowledge the epidemic of unreliable freelance coders abandoning schools in Uganda.",
          step2Reframe: "Present LANGRATIA's institutional backing, physical office, and escrow SLA milestones.",
          step3Hook: "Payment is strictly tied to successful school fees mobile money clearing during live term opening.",
        },
        winningScript: "Headteacher, you are not the first school director to tell me that. In Uganda, dozens of schools have been stranded by freelance developers who build a demo and disappear when issues arise. LANGRATIA is an enterprise engineering company with a physical office and dedicated SLA. To guarantee your peace of mind, we do not ask for full payment upfront. You pay on milestone sign-offs: the final settlement is only cleared after your parents successfully receive term circulars and school fees receipts without a single glitch.",
        voiceNoteHook: "Dear Principal, I completely hear you regarding past vendor letdowns. We back our school portal with milestone escrow and guaranteed term-time support. Let's arrange a 10-minute preview on school premises.",
      },
      {
        title: "We only pay on 90-day LPO / Board Approval",
        prospectQuote: "Our board only meets once a term, and finance only clears invoices 60-90 days after delivery with an approved LPO.",
        objectionCategory: "Payment Terms",
        rootFear: "Strict institutional procurement bureaucracy.",
        counterStrategy: {
          step1Validate: "Respect the governance structure of top-tier schools.",
          step2Reframe: "Separate infrastructure setup costs from terminal operational licensing.",
          step3Hook: "Accept an approved LPO with a 30% mobilization fee to lock in server provisioning before the new term.",
        },
        winningScript: "Understood, Principal. We work with leading educational boards across Uganda and respect your governance cadence. To ensure your school is fully onboarded and parents can pay fees seamlessly for next term, we can accept your official LPO and a standard 30% mobilization deposit via Mobile Money or wire to provision the dedicated cloud server, with the remainder structured on your 60-day cycle.",
        voiceNoteHook: "Hello Principal, we can accommodate your board's LPO schedule with a standard mobilization commitment so your teachers are trained before opening day.",
      },
    ],
  },
  {
    id: "retail",
    name: "Retail, Supermarkets & Wholesale",
    icon: "🛒",
    typicalTicket: "UGX 3.5M - 8M",
    objections: [
      {
        title: "The Nephew / In-House IT Argument",
        prospectQuote: "My brother-in-law built us an Excel spreadsheet and Access database for stock, and it costs us nothing.",
        objectionCategory: "In-House IT",
        rootFear: "Reluctance to pay for software when 'free' spreadsheets exist.",
        counterStrategy: {
          step1Validate: "Praise Excel for basic bookkeeping when starting out.",
          step2Reframe: "Expose critical vulnerabilities: inventory theft, accidental file deletion, zero audit logs, and lack of URA EFRIS compliance.",
          step3Hook: "Run an inventory reconciliation audit on their top 10 fastest moving SKUs to detect hidden discrepancy.",
        },
        winningScript: "Excel is great when you have 5 products, but in a busy retail or supermarket business, Excel cannot prevent staff from altering quantities, cannot sync in real-time with cash registers, and leaves you completely vulnerable to device crashes and theft. If an employee deletes a cell or changes an inventory count, you have no audit trail. LANGRATIA gives you cloud-backed inventory with role permissions and URA EFRIS tax compliance on every receipt.",
        voiceNoteHook: "Hi Boss, Excel works until stock mysteriously goes missing or a hard drive crashes. LANGRATIA locks every transaction with live mobile alerts to your phone. Let's run a 1-day stock audit together.",
      },
    ],
  },
  {
    id: "hospitality",
    name: "Hotels, Lodges & Restaurants",
    icon: "🏨",
    typicalTicket: "UGX 5M - 15M",
    objections: [
      {
        title: "We Rely on Booking.com & Walk-Ins",
        prospectQuote: "Foreign guests already find us on Booking.com, so why should we spend money on our own software?",
        objectionCategory: "Price & Budget",
        rootFear: "Belief that foreign aggregators are sufficient despite brutal commission fees.",
        counterStrategy: {
          step1Validate: "Recognize that OTAs give international reach.",
          step2Reframe: "Calculate the 18% OTA commission bleed: on UGX 30M in bookings, they forfeit UGX 5.4M to a foreign portal every month.",
          step3Hook: "Direct WhatsApp booking bot + instant Mobile Money deposit that cuts OTA commission to 0%.",
        },
        winningScript: "Booking.com brings international discovery, but they take 15% to 20% of your revenue on every single room. If your hotel closes UGX 40M this month, you are handing over UGX 8M in commissions. LANGRATIA gives you a direct 0% commission booking engine and automated WhatsApp concierge that takes Mobile Money and card payments directly into your account.",
        voiceNoteHook: "Hello General Manager, every guest booking through OTAs costs you 18% in fees. Our direct engine converts corporate repeat guests with 0% commission. Can I send you a 1-minute case study?",
      },
    ],
  },
];

export default function ObjectionSimulatorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedSector, setSelectedSector] = useState<SectorPreset>(SECTOR_DRILLS[0]);
  const [selectedObjectionIndex, setSelectedObjectionIndex] = useState(0);
  const [userPitch, setUserPitch] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [aiScore, setAiScore] = useState<{
    score: number;
    verdict: string;
    strengths: string[];
    improvements: string[];
    polishedRebuttal: string;
  } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedVoiceNote, setCopiedVoiceNote] = useState(false);

  if (!isOpen) return null;

  const activeObjection = selectedSector.objections[selectedObjectionIndex] || selectedSector.objections[0];

  const handleEvaluatePitch = () => {
    if (!userPitch.trim()) {
      alert("Please enter your pitch response to evaluate.");
      return;
    }

    setEvaluating(true);
    setAiScore(null);

    // Simulated local algorithmic sales evaluation
    setTimeout(() => {
      const pitchLower = userPitch.toLowerCase();
      let calculatedScore = 6;
      const strengths: string[] = [];
      const improvements: string[] = [];

      // Evaluation criteria
      if (pitchLower.includes("understand") || pitchLower.includes("agree") || pitchLower.includes("completely")) {
        calculatedScore += 1;
        strengths.push("Excellent empathy and validation — avoids arguing with the client.");
      } else {
        improvements.push("Start by explicitly validating the prospect's constraint before proposing solutions.");
      }

      if (pitchLower.includes("money") || pitchLower.includes("cost") || pitchLower.includes("leakage") || pitchLower.includes("ugx") || pitchLower.includes("revenue")) {
        calculatedScore += 1.5;
        strengths.push("Strong commercial reframing: quantified the financial cost of inaction.");
      } else {
        improvements.push("Quantify the cost in real numbers (UGX / lost client hours) so the price feels small in comparison.");
      }

      if (pitchLower.includes("pilot") || pitchLower.includes("deposit") || pitchLower.includes("milestone") || pitchLower.includes("start with") || pitchLower.includes("try")) {
        calculatedScore += 1.5;
        strengths.push("Decisive closing maneuver: lowers entry risk with phased milestones or deposit.");
      } else {
        improvements.push("End with a specific low-friction call-to-action (e.g. 30% milestone deposit or 15-min walkthrough).");
      }

      calculatedScore = Math.min(10, Math.max(5, calculatedScore));

      let verdict = "Solid Pitch — Good Sales Instincts";
      if (calculatedScore >= 8.5) verdict = "Elite Closer — High Win Probability";
      else if (calculatedScore <= 6.5) verdict = "Needs Sharper Commercial Leverage";

      setAiScore({
        score: Math.round(calculatedScore * 10) / 10,
        verdict,
        strengths,
        improvements,
        polishedRebuttal: activeObjection.winningScript,
      });

      setEvaluating(false);
    }, 600);
  };

  const handleCopy = (text: string, type: "script" | "voicenote") => {
    navigator.clipboard.writeText(text);
    if (type === "script") {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedVoiceNote(true);
      setTimeout(() => setCopiedVoiceNote(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-sky-500/30 bg-[#0d121d] shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-gradient-to-r from-sky-950/30 via-[#07090e] to-indigo-950/20">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-slate-950 font-black shadow-lg shadow-sky-500/20">
              <Shield className="h-5 w-5 fill-current" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  AI Sales Objection Simulator & East Africa Battle-Cards
                </h2>
                <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-sky-300 border border-sky-500/30">
                  Roleplay Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Master high-friction East African B2B objections: budgets, IT nephews, vendor mistrust, and slow payment terms.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SECTOR TABS */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 bg-[#07090e] px-6 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Industry Sector:
          </span>
          {SECTOR_DRILLS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => {
                setSelectedSector(sector);
                setSelectedObjectionIndex(0);
                setAiScore(null);
                setUserPitch("");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSector.id === sector.id
                  ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{sector.icon}</span>
              <span>{sector.name}</span>
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* OBJECTION SELECTOR TABS */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Objection Drill:
            </span>
            {selectedSector.objections.map((obj, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedObjectionIndex(idx);
                  setAiScore(null);
                  setUserPitch("");
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedObjectionIndex === idx
                    ? "bg-slate-800 text-white font-bold border border-slate-700"
                    : "bg-[#07090e] text-slate-400 border border-slate-800/80 hover:text-slate-200"
                }`}
              >
                {obj.title}
              </button>
            ))}
          </div>

          {/* SIMULATION ARENA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: PROSPECT SCENARIO & REBUTTAL BLUEPRINT */}
            <div className="space-y-4">
              {/* PROSPECT QUOTE CARD */}
              <div className="rounded-xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-[#07090e] to-[#07090e] p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                    <AlertCircle className="h-4 w-4" /> Client Objection Spoken
                  </span>
                  <span className="rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold">
                    {activeObjection.objectionCategory}
                  </span>
                </div>

                <div className="text-sm font-medium text-slate-200 italic leading-relaxed bg-[#0d121d] p-3.5 rounded-lg border border-slate-800/80">
                  &ldquo;{activeObjection.prospectQuote}&rdquo;
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Underlying Prospect Fear:</span>
                  <span>{activeObjection.rootFear}</span>
                </div>
              </div>

              {/* 3-STEP COUNTERPLAY FORMULA */}
              <div className="rounded-xl border border-slate-800 bg-[#07090e] p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                  <Target className="h-4 w-4" /> Strategic 3-Step Counter Blueprint
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="rounded-lg bg-[#0d121d] p-3 border border-slate-800">
                    <span className="font-bold text-amber-400 block mb-0.5">1. Validate & Empathize</span>
                    <p className="text-slate-300">{activeObjection.counterStrategy.step1Validate}</p>
                  </div>

                  <div className="rounded-lg bg-[#0d121d] p-3 border border-slate-800">
                    <span className="font-bold text-sky-400 block mb-0.5">2. Reframe the Cost of Inaction</span>
                    <p className="text-slate-300">{activeObjection.counterStrategy.step2Reframe}</p>
                  </div>

                  <div className="rounded-lg bg-[#0d121d] p-3 border border-slate-800">
                    <span className="font-bold text-emerald-400 block mb-0.5">3. The Low-Risk Closing Hook</span>
                    <p className="text-slate-300">{activeObjection.counterStrategy.step3Hook}</p>
                  </div>
                </div>
              </div>

              {/* WINNING BATTLE-CARD SCRIPT */}
              <div className="rounded-xl border border-emerald-500/30 bg-[#07090e] p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Master Battle-Card Rebuttal
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeObjection.winningScript, "script")}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {copiedScript ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedScript ? "Copied" : "Copy Script"}
                  </button>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed bg-[#0d121d] p-3.5 rounded-lg border border-slate-800/80">
                  {activeObjection.winningScript}
                </div>

                {/* VOICE NOTE HOOK */}
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp Voice Note Hook</span>
                    <p className="text-[11px] text-slate-300 line-clamp-1 italic">{activeObjection.voiceNoteHook}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeObjection.voiceNoteHook, "voicenote")}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 ml-2 whitespace-nowrap"
                  >
                    {copiedVoiceNote ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                    {copiedVoiceNote ? "Copied" : "Copy VN"}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: INTERACTIVE SIMULATOR DRILL & AI EVALUATOR */}
            <div className="space-y-4 flex flex-col">
              <div className="rounded-xl border border-slate-800 bg-[#07090e] p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                        <Zap className="h-4 w-4" />
                      </span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Live Roleplay Simulator: Test Your Pitch
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Uganda Sales AI</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">
                    Imagine the client just said &ldquo;{activeObjection.prospectQuote}&rdquo;. Type your immediate verbal response below to test your sales leverage.
                  </p>

                  <textarea
                    rows={6}
                    value={userPitch}
                    onChange={(e) => setUserPitch(e.target.value)}
                    placeholder="Type your spontaneous counter-pitch here, e.g.: 'Doctor, I completely understand that operating expenses are high right now...'"
                    className="w-full rounded-xl border border-slate-800 bg-[#0d121d] p-3 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none leading-relaxed resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleEvaluatePitch}
                    disabled={evaluating || !userPitch.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 py-2.5 text-xs font-bold text-slate-950 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Analyzing Pitch Tone & Leverage...
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4" />
                        Evaluate My Pitch (AI Score)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI EVALUATION REPORT */}
              {aiScore && (
                <div className="rounded-xl border border-indigo-500/30 bg-[#07090e] p-5 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        AI Evaluator Scorecard
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{aiScore.verdict}</h4>
                    </div>

                    <div className="flex items-baseline gap-1 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-xl">
                      <span className="text-2xl font-black text-indigo-400 font-mono">{aiScore.score}</span>
                      <span className="text-xs text-indigo-300/70 font-bold">/ 10</span>
                    </div>
                  </div>

                  {/* STRENGTHS */}
                  {aiScore.strengths.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> What You Did Well:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                        {aiScore.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* IMPROVEMENTS */}
                  {aiScore.improvements.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" /> High-Impact Coaching Tips:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                        {aiScore.improvements.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* COMPETITIVE MOAT SUMMARY */}
              <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  LANGRATIA Uganda Market Moat
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> MTN MoMo & Airtel Integration
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Billed in UGX (Zero USD FX Risk)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> On-site Kampala Engineering SLA
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> URA EFRIS Tax Compliant
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-800 px-6 py-3.5 bg-[#07090e]/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Selected Drill: <span className="font-semibold text-slate-300">{selectedSector.name} • {activeObjection.title}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 bg-[#0d121d] px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Close Drill
          </button>
        </div>
      </div>
    </div>
  );
}

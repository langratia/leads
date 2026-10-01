import { useState, useId } from "react";
import {
  Search,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Globe,
  Building2,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  Kanban,
  Clock,
  Download,
  ExternalLink,
  ChevronDown,
  Star,
  Zap,
  BarChart3,
  Users,
  Check,
  DollarSign,
  Send,
  Database,
  Menu,
  X,
  Target,
  Rocket,
} from "lucide-react";

interface LandingPageProps {
  session?: any;
  onLogout?: () => void;
}

interface SimulatedLead {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  email: string;
  phone: string;
  website: string;
  dealValue: string;
  stage: string;
}

export default function LandingPage({ session, onLogout }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);

  // Live Demo Simulator State
  const [selectedIndustry, setSelectedIndustry] = useState("AI & Cloud Solutions");
  const [selectedLocation, setSelectedLocation] = useState("London, United Kingdom");
  const [minRating, setMinRating] = useState("4.5");
  const [simulating, setSimulating] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);

  // ROI Calculator State
  const [monthlyProspects, setMonthlyProspects] = useState(300);
  const [avgDealSize, setAvgDealSize] = useState(8500);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const industries = [
    "AI & Cloud Solutions",
    "Fintech & Payments",
    "Boutique Architecture & Design",
    "Clean Energy & Solar",
    "Healthcare & Biotech",
  ];

  const locations = [
    "London, United Kingdom",
    "New York, NY, USA",
    "San Francisco, CA, USA",
    "Berlin, Germany",
    "Nairobi, Kenya",
    "Singapore",
  ];

  const sampleLeads: Record<string, SimulatedLead[]> = {
    "AI & Cloud Solutions": [
      {
        id: "l1",
        name: "Vortex Intelligence Systems Ltd",
        category: "AI & Machine Learning Consultancy",
        location: "Tech City, London EC1V",
        rating: 4.9,
        reviews: 84,
        email: "contact@vortexintel.co.uk",
        phone: "+44 20 7946 0912",
        website: "https://vortexintel.co.uk",
        dealValue: "$48,000",
        stage: "Proposal Sent",
      },
      {
        id: "l2",
        name: "Nexus Cloud Architecture",
        category: "Cloud Migration & DevOps",
        location: "Canary Wharf, London E14",
        rating: 4.8,
        reviews: 52,
        email: "growth@nexuscloud.io",
        phone: "+44 20 7946 0384",
        website: "https://nexuscloud.io",
        dealValue: "$32,500",
        stage: "Qualified",
      },
      {
        id: "l3",
        name: "Cognitive Automation Group",
        category: "Enterprise RPA & Data Engineering",
        location: "King's Cross, London N1C",
        rating: 4.7,
        reviews: 41,
        email: "partners@cogauto.ai",
        phone: "+44 20 7946 0881",
        website: "https://cogauto.ai",
        dealValue: "$65,000",
        stage: "Negotiation",
      },
    ],
    "Fintech & Payments": [
      {
        id: "l4",
        name: "Apex Pay Global Ltd",
        category: "Cross-Border Payment Infrastructure",
        location: "Bishopsgate, London EC2N",
        rating: 4.9,
        reviews: 119,
        email: "inquiries@apexpayglobal.com",
        phone: "+44 20 7123 4567",
        website: "https://apexpayglobal.com",
        dealValue: "$95,000",
        stage: "Proposal Sent",
      },
      {
        id: "l5",
        name: "EquiVault Asset Tech",
        category: "Institutional Ledger Platforms",
        location: "Finsbury Circus, London EC2M",
        rating: 4.8,
        reviews: 67,
        email: "bd@equivault.tech",
        phone: "+44 20 7890 1234",
        website: "https://equivault.tech",
        dealValue: "$54,000",
        stage: "Qualified",
      },
    ],
    "Boutique Architecture & Design": [
      {
        id: "l6",
        name: "Studio Atelier Modern",
        category: "Luxury Commercial Architecture",
        location: "Mayfair, London W1K",
        rating: 5.0,
        reviews: 38,
        email: "studio@ateliermodern.co.uk",
        phone: "+44 20 7456 7890",
        website: "https://ateliermodern.co.uk",
        dealValue: "$42,000",
        stage: "Contacted",
      },
      {
        id: "l7",
        name: "Elysian Spatial Design",
        category: "High-End Hospitality Interiors",
        location: "Kensington, London SW7",
        rating: 4.9,
        reviews: 49,
        email: "info@elysiandesign.co.uk",
        phone: "+44 20 7654 3210",
        website: "https://elysiandesign.co.uk",
        dealValue: "$68,000",
        stage: "Qualified",
      },
    ],
    "Clean Energy & Solar": [
      {
        id: "l8",
        name: "Helios Renewable Systems",
        category: "Commercial Solar EPC & Storage",
        location: "Vauxhall, London SW8",
        rating: 4.8,
        reviews: 94,
        email: "projects@heliosrenewables.com",
        phone: "+44 20 7987 6543",
        website: "https://heliosrenewables.com",
        dealValue: "$110,000",
        stage: "Proposal Sent",
      },
      {
        id: "l9",
        name: "Verdant Grid Solutions",
        category: "Grid Storage & Demand Balancing",
        location: "Paddington, London W2",
        rating: 4.9,
        reviews: 33,
        email: "contact@verdantgrid.energy",
        phone: "+44 20 7321 0987",
        website: "https://verdantgrid.energy",
        dealValue: "$85,000",
        stage: "Qualified",
      },
    ],
    "Healthcare & Biotech": [
      {
        id: "l10",
        name: "Synapse Biometrics Lab",
        category: "Clinical Data Platforms",
        location: "White City, London W12",
        rating: 4.9,
        reviews: 57,
        email: "info@synapsebio.org",
        phone: "+44 20 7111 2233",
        website: "https://synapsebio.org",
        dealValue: "$75,000",
        stage: "Negotiation",
      },
    ],
  };

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setHasSimulated(true);
    }, 600);
  };

  const currentLeads =
    sampleLeads[selectedIndustry] || sampleLeads["AI & Cloud Solutions"];

  // ROI Calculated values
  const pipelineValue = Math.round(monthlyProspects * 0.15 * avgDealSize);
  const hoursSaved = Math.round(monthlyProspects * 0.35);
  const closedRevenue = Math.round(monthlyProspects * 0.15 * 0.22 * avgDealSize);

  const faqs = [
    {
      q: "Where does Langratia Leads source its prospect data?",
      a: "Our discovery engine queries the official Google Places API (New) for verified, real-world businesses, local merchant registrations, customer review counts, and verified ratings. We then enrich each result with web domain audits, corporate email discovery, executive contact points, and phone numbers.",
    },
    {
      q: "Can I use my own Google Places API key or Supabase database?",
      a: "Yes. Langratia Leads is architected for total data sovereignty. You can bring your own Google Places API key, configure custom rate limits, and use your own self-hosted or managed Supabase PostgreSQL instance with full Row-Level Security (RLS).",
    },
    {
      q: "How does the Kanban Deal Pipeline differ from generic CRMs?",
      a: "Unlike clunky enterprise CRMs that take months to set up, Langratia Leads is purpose-built for high-velocity B2B prospecting. Moving a lead from 'Discovered' to 'Won' is frictionless, complete with automated follow-up cadences, deal value tracking, and unified email threads in one window.",
    },
    {
      q: "Can I export my leads and customer lists to CSV or JSON?",
      a: "Absolutely. With a single click, you can export all prospects, filtered subsets, pipeline stages, or search queries into clean, standard CSV or JSON files ready for Excel, Google Sheets, HubSpot, or Salesforce import.",
    },
    {
      q: "How does email threading and automated communication work?",
      a: "Langratia Leads integrates bi-directional email messaging directly on the lead profile. You can send personalized outreach messages, track status, and view replies chronologically without switching tabs or context.",
    },
    {
      q: "Is Langratia Leads available for external teams and agencies?",
      a: "Yes. While initially built as Langratia's proprietary internal sales engine, the platform is now open for select agency partners, high-growth B2B startups, and outbound sales teams looking for a lightning-fast prospecting workspace.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-sky-500/30 selection:text-sky-200">
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
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#07090e]/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-sky-300 text-sm font-black text-slate-950 shadow-md shadow-sky-500/25 transition-transform group-hover:scale-105">
              L
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-brand text-base font-extrabold tracking-tight text-white">
                  LANGRATIA
                </span>
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Leads
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">
                B2B Intelligence &amp; Sales CRM
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Live Demo
            </a>
            <a href="#pipeline" className="hover:text-white transition-colors">
              Pipeline
            </a>
            <a href="#calculator" className="hover:text-white transition-colors">
              ROI Calculator
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://langratia.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Langratia.com <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            {session ? (
              <div className="flex items-center gap-3">
                <a
                  href="/app"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all cursor-pointer"
                >
                  <Rocket className="h-3.5 w-3.5" /> Open CRM
                </a>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="rounded-lg border border-slate-700/80 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all"
                >
                  Sign In
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 hover:bg-sky-400 transition-all cursor-pointer"
                >
                  Launch App <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#0a0d16] px-4 py-6 space-y-4">
            <div className="flex flex-col space-y-3 text-sm font-medium text-slate-200">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400"
              >
                Features
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400"
              >
                Live Demo
              </a>
              <a
                href="#pipeline"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400"
              >
                Pipeline
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400"
              >
                ROI Calculator
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400"
              >
                Pricing
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-sky-400"
              >
                FAQ
              </a>
            </div>
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <a
                href="/login"
                className="flex items-center justify-center rounded-lg bg-sky-500 py-2.5 text-xs font-bold text-slate-950"
              >
                {session ? "Open CRM Platform" : "Launch Leads CRM"}
              </a>
              <a
                href="https://langratia.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center text-xs text-slate-400 py-1.5"
              >
                Visit Langratia.com ↗
              </a>
            </div>
          </div>
        )}
      </header>

      {/* MAIN BODY CONTENT */}
      <main className="relative z-10">
        {/* ========================================================
            HERO SECTION
            ======================================================== */}
        <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Top Tag Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-400 shadow-sm shadow-sky-500/10 backdrop-blur-md mb-8">
              <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
              <span>Langratia Intelligence OS • Built for High-Velocity B2B Outbound</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className="mx-auto max-w-5xl font-brand text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
              Turn Local Discovery Into{" "}
              <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Closed Enterprise Deals.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              The high-performance prospecting and deal-execution CRM. Harness Google Places
              geospatial data, automated multi-source enrichment, and deal-velocity kanban to
              source, verify, and close high-ticket clients 10x faster.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={session ? "/app" : "/login"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-sky-500/25 hover:from-sky-400 hover:to-sky-300 transition-all cursor-pointer"
              >
                <Zap className="h-4 w-4 fill-slate-950" />
                {session ? "Go to CRM Dashboard" : "Launch Leads CRM"}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                <Search className="h-4 w-4 text-sky-400" />
                Try Interactive Demo
              </a>
            </div>

            {/* Trust and Performance Metrics */}
            <div className="mt-16 border-y border-slate-800/80 bg-slate-950/40 py-6 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="flex flex-col items-center">
                  <span className="font-brand text-2xl sm:text-3xl font-extrabold text-white">
                    30,000+
                  </span>
                  <span className="mt-1 text-xs font-medium text-slate-400">
                    Verified B2B Leads Sourced
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-brand text-2xl sm:text-3xl font-extrabold text-sky-400">
                    99.2%
                  </span>
                  <span className="mt-1 text-xs font-medium text-slate-400">
                    Deliverable Contact Points
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-brand text-2xl sm:text-3xl font-extrabold text-indigo-400">
                    3.4x
                  </span>
                  <span className="mt-1 text-xs font-medium text-slate-400">
                    Faster Deal Cycle Velocity
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-brand text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    &lt; 500ms
                  </span>
                  <span className="mt-1 text-xs font-medium text-slate-400">
                    Global Edge Query Speed
                  </span>
                </div>
              </div>
            </div>

            {/* HERO PRODUCT PREVIEW SHOWCASE */}
            <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-[#0c101c]/90 p-3 sm:p-5 shadow-2xl shadow-sky-500/10 backdrop-blur-xl">
              {/* Window Controls */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-sky-400" />
                    leads.langratia.com • Active Workspace
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Google Places API Connected
                  </span>
                </div>
              </div>

              {/* Inside Showcase Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-left">
                {/* Left: Discovery Filter & Prospect Card */}
                <div className="lg:col-span-7 rounded-xl border border-slate-800/80 bg-[#080b14] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-sky-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Places Lead Finder
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Query: <code className="text-sky-300">Software &amp; AI in London</code>
                    </span>
                  </div>

                  {/* Mock lead item */}
                  <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            Vortex Intelligence Systems
                          </h4>
                          <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          Old Street, London EC1V • 4.9★ (84 Google reviews)
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                        $48,000 Deal
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="h-3 w-3 text-sky-400" /> contact@vortexintel.co.uk
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="h-3 w-3 text-sky-400" /> +44 20 7946 0912
                      </div>
                    </div>
                  </div>

                  {/* Second mock lead */}
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">Nexus Cloud Architecture</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-500" /> Canary Wharf, London • 4.8★
                          (52 reviews)
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-bold text-sky-400 border border-sky-500/20">
                        $32,500 Deal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Kanban Pipeline Glance */}
                <div className="lg:col-span-5 rounded-xl border border-slate-800/80 bg-[#080b14] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                        <Kanban className="h-3.5 w-3.5 text-indigo-400" /> Deal Flow Pipeline
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400">$384,500 Active</span>
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Prospects Sourced</div>
                          <div className="text-[10px] text-slate-500">28 new leads today</div>
                        </div>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                          28
                        </span>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">Proposal Sent</div>
                          <div className="text-[10px] text-slate-500">8 pending review</div>
                        </div>
                        <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-bold text-sky-300">
                          $142,000
                        </span>
                      </div>

                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-emerald-300">Closed Won 🎉</div>
                          <div className="text-[10px] text-emerald-400/80">3 enterprise contracts</div>
                        </div>
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                          $175,000
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Automated Follow-ups: Active</span>
                    <span className="text-sky-400 font-semibold">100% In-Sync</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION: INTERACTIVE LIVE DEMO SIMULATOR
            ======================================================== */}
        <section id="demo" className="py-20 bg-slate-950/60 border-t border-slate-800/80 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                Interactive Test Drive
              </span>
              <h2 className="mt-2 font-brand text-3xl sm:text-4xl font-extrabold text-white">
                Simulate Prospect Discovery in Real-Time
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-400">
                Select an industry and geographical territory below to test our prospecting and data
                enrichment simulation.
              </p>
            </div>

            {/* Simulator Console Card */}
            <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-[#090d18] p-6 sm:p-8 shadow-2xl">
              {/* Interactive Controls Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-800/80">
                {/* Industry selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Niche / Industry
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-black px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-sky-500"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Territory / City
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-black px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-sky-500"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Rating Threshold
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-black px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-sky-500"
                  >
                    <option value="4.0">4.0★ and above</option>
                    <option value="4.5">4.5★ and above (Recommended)</option>
                    <option value="4.8">4.8★ and above (Top-tier only)</option>
                  </select>
                </div>
              </div>

              {/* Action trigger button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                <div className="text-xs text-slate-400">
                  Ready to discover verified targets in <strong className="text-white">{selectedLocation}</strong>
                </div>
                <button
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 hover:bg-sky-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  {simulating ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                      Scanning Places API…
                    </>
                  ) : (
                    <>
                      <Search className="h-3.5 w-3.5" />
                      Simulate Discovery
                    </>
                  )}
                </button>
              </div>

              {/* Results Container */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Enriched Discovery Feed ({currentLeads.length} matches)</span>
                  <span className="text-sky-400">Filter Applied: &gt;={minRating}★</span>
                </div>

                {currentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-slate-800/80 bg-black/60 p-4 transition-all hover:border-slate-700 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{lead.name}</h4>
                          <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                            <Star className="h-2.5 w-2.5 fill-amber-400" />
                            {lead.rating} ({lead.reviews} reviews)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{lead.category}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-400 border border-indigo-500/20">
                          {lead.dealValue}
                        </span>
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                          {lead.stage}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Globe className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:underline truncate"
                        >
                          {lead.website.replace("https://", "")}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Banner */}
              <div className="mt-8 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  Want to unlock live discovery for 1,000+ businesses daily with automated email
                  sync?
                </div>
                <a
                  href={session ? "/app" : "/login"}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 transition-colors whitespace-nowrap"
                >
                  Enter Full CRM <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION: CORE CAPABILITIES & BENTO GRID
            ======================================================== */}
        <section id="features" className="py-24 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                Precision Sales Engineering
              </span>
              <h2 className="mt-2 font-brand text-3xl sm:text-5xl font-extrabold text-white">
                Everything You Need to Dominate Your Market
              </h2>
              <p className="mt-3 text-slate-400 text-sm sm:text-base">
                Engineered for speed, data accuracy, and maximum conversion. Built on modern web
                standards and high-performance edge infrastructure.
              </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Google Places Intelligence */}
              <div className="group rounded-2xl border border-slate-800 bg-[#090d18] p-7 transition-all hover:border-sky-500/40 hover:bg-[#0c1222]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-5 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-brand text-lg font-bold text-white">
                  Precision Places Discovery
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Query real-world businesses with pinpoint accuracy using Google Places API (New).
                  Filter by exact coordinates, search keywords, review count thresholds, and verified
                  star ratings.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                  <span>Sub-second geospatial lookups</span>
                </div>
              </div>

              {/* Card 2: Multi-Source Enrichment */}
              <div className="group rounded-2xl border border-slate-800 bg-[#090d18] p-7 transition-all hover:border-indigo-500/40 hover:bg-[#0c1222]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-brand text-lg font-bold text-white">
                  Automated Contact Enrichment
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  No more spending hours Googling for emails. Our pipeline automatically inspects
                  domains to extract verified corporate email addresses, executive phone numbers,
                  and direct channels.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                  <span>99.2% verified deliverability</span>
                </div>
              </div>

              {/* Card 3: Kanban Pipeline Board */}
              <div className="group rounded-2xl border border-slate-800 bg-[#090d18] p-7 transition-all hover:border-emerald-500/40 hover:bg-[#0c1222]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-5 group-hover:scale-110 transition-transform">
                  <Kanban className="h-6 w-6" />
                </div>
                <h3 className="font-brand text-lg font-bold text-white">
                  Visual Deal Pipeline
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Track every deal visually across 6 stages: Prospect, Contacted, Qualified,
                  Proposal, Negotiation, and Won. Drag-and-drop cards with real-time pipeline sum
                  calculations.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <span>Drag-and-drop lifecycle flow</span>
                </div>
              </div>

              {/* Card 4: Bi-Directional Email Threads */}
              <div className="group rounded-2xl border border-slate-800 bg-[#090d18] p-7 transition-all hover:border-sky-500/40 hover:bg-[#0c1222]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-5 group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="font-brand text-lg font-bold text-white">
                  Integrated Email Communications
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Send outreach, track engagement, and view conversational reply threads directly
                  inside the lead profile. Everything stays organized in one unified contact log.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                  <span>Native Resend &amp; SMTP hooks</span>
                </div>
              </div>

              {/* Card 5: Smart Cadence & Follow-Ups */}
              <div className="group rounded-2xl border border-slate-800 bg-[#090d18] p-7 transition-all hover:border-amber-500/40 hover:bg-[#0c1222]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-5 group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-brand text-lg font-bold text-white">
                  Zero-Slip Follow-Up Engine
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Over 60% of B2B deals close on the 4th touchpoint. Langratia Leads queues your
                  scheduled follow-ups, alerts you when prospects are warm, and enables 1-click
                  snoozing.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <span>Never lose a high-ticket client</span>
                </div>
              </div>

              {/* Card 6: Total Data Sovereignty */}
              <div className="group rounded-2xl border border-slate-800 bg-[#090d18] p-7 transition-all hover:border-purple-500/40 hover:bg-[#0c1222]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-brand text-lg font-bold text-white">
                  Data Sovereignty &amp; Instant Exports
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  No seat taxes or vendor lock-in. Powered by Supabase PostgreSQL with strict
                  Row-Level Security. Export any view or segment to CSV/JSON anytime with zero
                  restrictions.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                  <span>1-click CSV &amp; JSON data export</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION: PIPELINE WORKFLOW (3-STEP ENGINE)
            ======================================================== */}
        <section id="pipeline" className="py-20 bg-slate-950/40 border-t border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                The Growth Methodology
              </span>
              <h2 className="mt-2 font-brand text-3xl sm:text-4xl font-extrabold text-white">
                How Deals Flow From Cold Discovery to Revenue
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="rounded-2xl border border-slate-800 bg-[#080c16] p-7 relative">
                <span className="text-4xl font-black text-slate-800 select-none">01</span>
                <h3 className="mt-2 font-brand text-lg font-bold text-white">
                  Pinpoint High-Intent Targets
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Input target business niches and geographical regions. Our edge proxy calls Google
                  Places to collect registered commercial enterprises with verified customer ratings.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-sky-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Filter by ratings &amp; verified addresses
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-sky-500/30 bg-[#080c16] p-7 relative shadow-lg shadow-sky-500/5">
                <span className="text-4xl font-black text-sky-500/40 select-none">02</span>
                <h3 className="mt-2 font-brand text-lg font-bold text-white">
                  Enrich &amp; Qualify Automatically
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Extract primary websites, email channels, and phone numbers. Assign initial deal
                  values, tag client categories, and push verified records into your pipeline.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-sky-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> 1-Click addition to CRM stages
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-slate-800 bg-[#080c16] p-7 relative">
                <span className="text-4xl font-black text-slate-800 select-none">03</span>
                <h3 className="mt-2 font-brand text-lg font-bold text-white">
                  Engage, Track &amp; Close Deals
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Send personalized email messages, schedule follow-ups, and move deals through
                  Proposal to Closed Won. Keep your team aligned with live stage summaries.
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Real-time conversion velocity
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION: INTERACTIVE ROI & PIPELINE ESTIMATOR
            ======================================================== */}
        <section id="calculator" className="py-20 border-t border-slate-800/80 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                Revenue Forecasting
              </span>
              <h2 className="mt-2 font-brand text-3xl sm:text-4xl font-extrabold text-white">
                Calculate Your Pipeline Potential
              </h2>
              <p className="mt-3 text-slate-400 text-sm sm:text-base">
                See how much revenue and prospecting time your team can unlock each month using
                Langratia Leads.
              </p>
            </div>

            <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-[#0a0f1e] p-6 sm:p-10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Sliders Input Column */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                      <span>Monthly Targeted Prospects</span>
                      <span className="font-bold text-sky-400">{monthlyProspects} Leads</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      step="50"
                      value={monthlyProspects}
                      onChange={(e) => setMonthlyProspects(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>50 leads</span>
                      <span>1,500 leads</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                      <span>Average Deal Value</span>
                      <span className="font-bold text-emerald-400">
                        ${avgDealSize.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="30000"
                      step="500"
                      value={avgDealSize}
                      onChange={(e) => setAvgDealSize(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>$1,000</span>
                      <span>$30,000</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic">
                    *Assumes standard 15% discovery qualification rate and conservative 22% deal close
                    rate.
                  </p>
                </div>

                {/* Output Cards Column */}
                <div className="rounded-xl border border-slate-800/80 bg-black/60 p-6 space-y-4">
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Qualified Pipeline Generated
                    </span>
                    <div className="mt-1 font-brand text-3xl font-extrabold text-white">
                      ${pipelineValue.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500"> / month</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Estimated Closed Revenue
                    </span>
                    <div className="mt-1 font-brand text-2xl font-extrabold text-emerald-400">
                      ${closedRevenue.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500"> / month</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Manual Research Hours Saved
                    </span>
                    <div className="mt-1 font-brand text-2xl font-extrabold text-sky-400">
                      ~{hoursSaved} Hours
                      <span className="text-xs font-normal text-slate-500"> / month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION: COMPARISON MATRIX
            ======================================================== */}
        <section className="py-20 bg-slate-950/50 border-t border-slate-800/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                The Competitive Edge
              </span>
              <h2 className="mt-2 font-brand text-3xl sm:text-4xl font-extrabold text-white">
                Why High-Growth Teams Choose Langratia Leads
              </h2>
            </div>

            <div className="mx-auto max-w-4xl overflow-x-auto rounded-2xl border border-slate-800 bg-[#090d18] shadow-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="p-4 font-bold text-slate-300">Feature &amp; Capability</th>
                    <th className="p-4 font-extrabold text-sky-400 bg-sky-500/10 border-x border-sky-500/20 text-center">
                      Langratia Leads
                    </th>
                    <th className="p-4 font-semibold text-slate-400 text-center">Legacy Enterprise CRMs</th>
                    <th className="p-4 font-semibold text-slate-400 text-center">Manual Scraping &amp; Sheets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  <tr>
                    <td className="p-4 font-medium">Google Places Real-Time API Search</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-500">Requires Expensive Add-ons</td>
                    <td className="p-4 text-center text-slate-500">Manual Copy-Paste</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Automated Contact &amp; Email Enrichment</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-500">$99+/seat add-on</td>
                    <td className="p-4 text-center text-slate-500">Hours of Manual Research</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">No Per-Seat Pricing Penalty</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-rose-400">Strict Per-User Tax</td>
                    <td className="p-4 text-center text-slate-400">Free but Fragmented</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Drag-and-Drop Kanban Deal Velocity</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-300">Included (Complex Setup)</td>
                    <td className="p-4 text-center text-slate-500">Clunky Formulas</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">100% Data Sovereignty (Supabase RLS)</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-500">Walled Garden</td>
                    <td className="p-4 text-center text-slate-500">Unencrypted Spreadsheets</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Instant 1-Click CSV &amp; JSON Export</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-400">Restricted Rate Limits</td>
                    <td className="p-4 text-center text-slate-300">Native</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION: PRICING & ACCESS TIERS
            ======================================================== */}
        <section id="pricing" className="py-24 border-t border-slate-800/80 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                Transparent Investment
              </span>
              <h2 className="mt-2 font-brand text-3xl sm:text-5xl font-extrabold text-white">
                Simple, High-ROI Plans
              </h2>
              <p className="mt-3 text-slate-400 text-sm sm:text-base">
                Choose the prospecting capacity that fits your sales team. Cancel anytime with zero
                lock-in.
              </p>

              {/* Billing Toggle */}
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 p-1.5 backdrop-blur-md">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    !annualBilling ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    annualBilling ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Yearly
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {/* Tier 1: Starter */}
              <div className="rounded-2xl border border-slate-800 bg-[#090d18] p-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-brand text-lg font-bold text-white">Starter</h3>
                  <p className="mt-1 text-xs text-slate-400">For solo dealmakers and founders.</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-brand text-4xl font-extrabold text-white">
                      ${annualBilling ? "39" : "49"}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <ul className="mt-8 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> 500 Places Searches / mo
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> 250 Contact Enrichments
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Kanban Deal Pipeline Board
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> CSV &amp; JSON Export
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Single User Workspace
                    </li>
                  </ul>
                </div>

                <a
                  href="/login"
                  className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-center text-xs font-bold text-white hover:bg-slate-700 transition-colors"
                >
                  Get Started
                </a>
              </div>

              {/* Tier 2: Growth (Popular) */}
              <div className="rounded-2xl border-2 border-sky-500 bg-[#0c1224] p-8 flex flex-col justify-between relative shadow-2xl shadow-sky-500/15">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                  Most Popular
                </div>
                <div>
                  <h3 className="font-brand text-lg font-bold text-white">Growth Outbound</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    For active sales teams closing weekly deals.
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-brand text-4xl font-extrabold text-white">
                      ${annualBilling ? "99" : "129"}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <ul className="mt-8 space-y-3 text-xs text-slate-200">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> 2,500 Places Searches / mo
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Unlimited Enriched Contacts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Bi-directional Email Threads
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Automated Follow-up Cadences
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Multi-Seat Team Access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Priority Support &amp; Webhooks
                    </li>
                  </ul>
                </div>

                <a
                  href="/login"
                  className="mt-8 w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 py-3 text-center text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-sky-300 transition-all cursor-pointer"
                >
                  Start Outbound Growth
                </a>
              </div>

              {/* Tier 3: Enterprise */}
              <div className="rounded-2xl border border-slate-800 bg-[#090d18] p-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-brand text-lg font-bold text-white">Enterprise</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    For large agencies and scaling enterprises.
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-brand text-4xl font-extrabold text-white">
                      ${annualBilling ? "279" : "349"}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>

                  <ul className="mt-8 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Unlimited Places Searches
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Dedicated Supabase Database
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Custom Scrapers &amp; Webhooks
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Dedicated Account Manager
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-sky-400 shrink-0" /> Custom SLA &amp; Security Review
                    </li>
                  </ul>
                </div>

                <a
                  href="https://langratia.com/contact"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-center text-xs font-bold text-white hover:bg-slate-700 transition-colors"
                >
                  Talk to Enterprise Sales
                </a>
              </div>
            </div>

            {/* Note banner */}
            <div className="mt-12 text-center text-xs text-slate-400">
              ⚡ Internal sales team? Use the{" "}
              <a href="/login" className="text-sky-400 underline font-semibold">
                Staff Authentication Portal
              </a>{" "}
              for direct workspace access.
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION: INTERACTIVE FAQ ACCORDION
            ======================================================== */}
        <section id="faq" className="py-20 bg-slate-950/40 border-t border-slate-800/80">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                Got Questions?
              </span>
              <h2 className="mt-2 font-brand text-3xl sm:text-4xl font-extrabold text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-[#090d18] transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        openFaq === idx ? "rotate-180 text-sky-400" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION: FINAL CONVERSION CTA BANNER
            ======================================================== */}
        <section className="py-20 relative overflow-hidden">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-950/40 via-slate-950 to-black p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />

              <h2 className="font-brand text-3xl sm:text-5xl font-black text-white tracking-tight">
                Accelerate Your B2B Outbound Today.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300">
                Stop wasting hours on manual research. Tap into verified Google Places intelligence
                and close higher-value contracts with Langratia Leads.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={session ? "/app" : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-sky-500/25 hover:bg-sky-400 transition-all cursor-pointer"
                >
                  <Rocket className="h-4 w-4" />
                  {session ? "Enter CRM OS" : "Launch Leads CRM"}
                </a>
                <a
                  href="https://langratia.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-all"
                >
                  Langratia Ecosystem <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-black py-12 text-slate-500 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-xs font-black text-slate-950">
              L
            </span>
            <span className="font-brand text-sm font-bold text-white tracking-tight">
              LANGRATIA LEADS
            </span>
            <span className="text-[10px] text-slate-500">• v2.4 Intelligence Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-slate-300 transition-colors">
              Simulator
            </a>
            <a href="#pricing" className="hover:text-slate-300 transition-colors">
              Pricing
            </a>
            <a href="/login" className="hover:text-slate-300 transition-colors">
              CRM Portal
            </a>
            <a
              href="https://langratia.com"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              Langratia Corporate <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>All Edge Systems Operational</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-600">
          © {new Date().getFullYear()} Langratia. All rights reserved. Google Places is a trademark
          of Google LLC.
        </div>
      </footer>
    </div>
  );
}

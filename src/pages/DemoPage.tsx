import { useState } from "react";
import { Link } from "wouter";
import {
  Search,
  Star,
  Mail,
  Phone,
  Globe,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import MarketingLayout from "../components/marketing/MarketingLayout";

interface PageProps {
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

export default function DemoPage({ session, onLogout }: PageProps) {
  const [selectedIndustry, setSelectedIndustry] = useState("AI & Cloud Solutions");
  const [selectedLocation, setSelectedLocation] = useState("London, United Kingdom");
  const [minRating, setMinRating] = useState("4.5");
  const [simulating, setSimulating] = useState(false);

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
    }, 500);
  };

  const currentLeads =
    sampleLeads[selectedIndustry] || sampleLeads["AI & Cloud Solutions"];

  return (
    <MarketingLayout session={session} onLogout={onLogout}>
      {/* PAGE HEADER */}
      <section className="pt-20 pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-400 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Discovery Simulator</span>
        </div>
        <h1 className="font-brand text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Test Drive Prospecting in{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            Real-Time.
          </span>
        </h1>
        <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Experience how Langratia Leads searches Google Places, filters high-intent commercial
          targets, and enriches them with verified corporate emails and deal values.
        </p>
      </section>

      {/* SIMULATOR COMPONENT */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-[#090d18] p-6 sm:p-10 shadow-2xl space-y-6">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-800/80">
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

            {/* Run Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Scanning verified commercial listings in <strong className="text-white">{selectedLocation}</strong>
              </div>
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 hover:bg-sky-400 transition-all cursor-pointer disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Querying Places Proxy…
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    Simulate Discovery
                  </>
                )}
              </button>
            </div>

            {/* Feed */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Enriched Discovery Feed ({currentLeads.length} matches)</span>
                <span className="text-sky-400">Rating filter: &gt;={minRating}★</span>
              </div>

              {currentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-xl border border-slate-800/80 bg-black/60 p-5 transition-all hover:border-slate-700 space-y-3"
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

            {/* Bottom Workspace Action */}
            <div className="mt-8 rounded-2xl border border-sky-500/30 bg-sky-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-200">
                Ready to prospect live businesses in your market with direct email syncing and Kanban
                deal stages?
              </div>
              <Link
                href={session ? "/app" : "/login"}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition-colors whitespace-nowrap cursor-pointer"
              >
                Launch Workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

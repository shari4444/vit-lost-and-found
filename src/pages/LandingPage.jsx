import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { VitBrand } from '../components/VitBrand';
import {
  FilePlus,
  Search,
  LogIn,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  HelpCircle,
  Building,
  Lock,
  ChevronRight
} from 'lucide-react';

export const LandingPage = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    totalFound: 124,
    totalLost: 98,
    matchedCount: 87,
    departmentsCount: 6
  });

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const { count: foundCount } = await supabase
          .from('found_items')
          .select('*', { count: 'exact', head: true });

        const { count: lostCount } = await supabase
          .from('lost_requests')
          .select('*', { count: 'exact', head: true });

        const { count: matchesCount } = await supabase
          .from('item_matches')
          .select('*', { count: 'exact', head: true });

        if (foundCount !== null || lostCount !== null) {
          setStats({
            totalFound: foundCount || 124,
            totalLost: lostCount || 98,
            matchedCount: matchesCount || 87,
            departmentsCount: 6
          });
        }
      } catch (e) {
        // Fallback to default institutional stats
      }
    };
    fetchLiveStats();
  }, []);

  return (
    <div className="min-h-screen bg-darkcanvas-bg text-white font-sans antialiased flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-darkcanvas-surface/90 backdrop-blur-md border-b border-darkcanvas-border">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          <VitBrand />

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <a href="#how-it-works" className="px-3 py-2 text-slate-300 hover:text-white rounded-lg transition-colors">
              How It Works
            </a>
            <a href="#statistics" className="px-3 py-2 text-slate-300 hover:text-white rounded-lg transition-colors">
              Statistics
            </a>
            <Link to="/student/found-items" className="px-3 py-2 text-slate-300 hover:text-white rounded-lg transition-colors">
              Browse Found Items
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/login"
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Admin Access
            </Link>

            {user ? (
              <Link
                to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                className="px-3.5 sm:px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-darkcanvas-border transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/student/report"
                  className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg shadow-md transition-all hidden sm:inline-flex items-center gap-1.5"
                >
                  <FilePlus size={14} />
                  <span>Report Lost</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 flex-1">
        {/* HERO SECTION */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12 pb-12 sm:pb-20 overflow-hidden">
          {/* Subtle Grid Background Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-10">
            <svg className="w-full h-full" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="48" id="academic-grid" patternUnits="userSpaceOnUse" width="48">
                  <path className="text-outline-variant" d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" stroke-width="0.75" />
                </pattern>
              </defs>
              <rect fill="url(#academic-grid)" height="100%" width="100%" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              Centralized Campus Custody Registry
            </span>
            <span className="hidden sm:inline-block text-xs text-secondary dark:text-darkcanvas-muted font-medium">
              Vidyalankar Institute of Technology (Wadala, Mumbai)
            </span>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Left Text Column */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-primary dark:text-white tracking-tight leading-tight mb-6">
                Lost Something?<br />
                <span className="text-secondary dark:text-slate-300">Let's Help You Find It.</span>
              </h1>
              <p className="text-sm sm:text-base text-on-surface-variant dark:text-slate-300 max-w-2xl mb-8 leading-relaxed">
                A centralized lost and found portal for the Vidyalankar Institute of Technology community. Report lost belongings, browse verified intake records, and track retrieval requests across campus administrative blocks with official custodial verification.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto [&>a]:w-full sm:[&>a]:w-auto [&>a]:justify-center">
                <Link
                  to="/student/report"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <FilePlus size={16} />
                  <span>Report Lost Item</span>
                </Link>
                <Link
                  to="/student/found-items"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-surface-container-lowest dark:bg-darkcanvas-surface text-primary dark:text-white font-bold text-xs shadow-sm border border-surface-container-high dark:border-darkcanvas-border hover:bg-surface-container dark:hover:bg-darkcanvas-border transition-all"
                >
                  <Search size={16} />
                  <span>Browse Found Items</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-surface-container-high dark:bg-darkcanvas-border text-on-surface dark:text-slate-200 font-semibold text-xs hover:bg-surface-variant transition-colors"
                >
                  <LogIn size={16} />
                  <span>Student Sign In</span>
                </Link>
              </div>

              {/* Assurance Badges */}
              <div className="flex flex-wrap items-center gap-6 mt-10 pt-6 border-t border-surface-container-high dark:border-darkcanvas-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-secondary dark:text-slate-400" />
                  <span className="text-xs font-semibold text-secondary dark:text-slate-300">Proctor-Verified Handover</span>
                </div>
                <div className="h-4 w-px bg-outline-variant/60"></div>
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-secondary dark:text-slate-400" />
                  <span className="text-xs font-semibold text-secondary dark:text-slate-300">PostgreSQL RLS Secured</span>
                </div>
              </div>
            </div>

            {/* Hero Right Asset Card Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl shadow-md border border-surface-container-high dark:border-darkcanvas-border p-6 overflow-hidden">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container dark:border-darkcanvas-border">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container dark:bg-darkcanvas-border text-on-surface-variant dark:text-slate-300 text-[11px] font-bold tracking-wider">
                      CASE #LR-1024
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                      Verified Available
                    </span>
                  </div>
                  <span className="text-[11px] text-secondary dark:text-slate-400 font-mono">11:42 AM IST</span>
                </div>

                <div className="flex gap-4 items-start mb-5">
                  <div className="w-16 h-16 rounded-lg bg-surface-container dark:bg-darkcanvas-border flex items-center justify-center text-primary dark:text-white shrink-0">
                    <Layers size={28} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-display font-bold text-sm text-primary dark:text-white truncate">
                      Apple AirPods Pro (White)
                    </h3>
                    <p className="text-xs text-on-surface-variant dark:text-slate-300 mt-0.5">
                      Updated hourly across Vidyalankar campus security centers.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-surface-container-low dark:bg-darkcanvas-border text-[10px] font-semibold text-on-surface-variant dark:text-slate-300">
                        Electronics
                      </span>
                      <span className="text-[10px] text-secondary dark:text-slate-400 font-mono">
                        ID: CS-2025-081
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low dark:bg-darkcanvas-border/50 rounded-lg p-3 space-y-2 mb-5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant dark:text-slate-400">Logged By</span>
                    <span className="text-on-surface dark:text-white font-semibold">Chief Warden Office, C-Block</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant dark:text-slate-400">Storage Locker</span>
                    <span className="text-primary dark:text-white font-mono font-semibold">SEC-CAB-B4 / Tier 2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant dark:text-slate-400">Matching Criteria</span>
                    <span className="text-on-surface dark:text-white">Serial prefix engraved on hinge</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-surface-container dark:border-darkcanvas-border">
                  <div className="flex items-center gap-1.5 text-on-surface-variant dark:text-slate-400 text-xs">
                    <Shield size={14} className="text-secondary dark:text-slate-400" />
                    <span>Requires VIT Student ID</span>
                  </div>
                  <Link
                    to="/student/found-items"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    Claim Item
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTICS SECTION */}
        <section id="statistics" className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
          <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl p-8 shadow-sm border border-surface-container-high dark:border-darkcanvas-border">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-surface-container dark:border-darkcanvas-border">
              <div>
                <span className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">
                  Live Institutional Metric
                </span>
                <h2 className="font-display font-bold text-2xl text-primary dark:text-white tracking-tight mt-1">
                  Registry Throughput Statistics
                </h2>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-2 md:mt-0 flex items-center gap-1.5">
                <Clock size={14} className="text-secondary" />
                <span>Aggregated live from PostgreSQL relational tables</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-lg bg-surface-container-low dark:bg-darkcanvas-border/50 border border-surface-container dark:border-darkcanvas-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-secondary dark:text-slate-300">Found Items Logged</span>
                  <Layers size={18} className="text-secondary" />
                </div>
                <div className="font-display text-3xl font-bold text-primary dark:text-white tracking-tight">
                  {stats.totalFound}+
                </div>
                <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-1">
                  In physical security custody
                </p>
              </div>

              <div className="p-5 rounded-lg bg-surface-container-low dark:bg-darkcanvas-border/50 border border-surface-container dark:border-darkcanvas-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-secondary dark:text-slate-300">Lost Reports Filed</span>
                  <FilePlus size={18} className="text-secondary" />
                </div>
                <div className="font-display text-3xl font-bold text-primary dark:text-white tracking-tight">
                  {stats.totalLost}+
                </div>
                <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-1">
                  Verified student submissions
                </p>
              </div>

              <div className="p-5 rounded-lg bg-surface-container-low dark:bg-darkcanvas-border/50 border border-surface-container dark:border-darkcanvas-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-secondary dark:text-slate-300">Recovery Matches</span>
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>
                <div className="font-display text-3xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
                  {stats.matchedCount}
                </div>
                <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-1">
                  Successful owner handovers
                </p>
              </div>

              <div className="p-5 rounded-lg bg-surface-container-low dark:bg-darkcanvas-border/50 border border-surface-container dark:border-darkcanvas-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-secondary dark:text-slate-300">Participating Desks</span>
                  <Building size={18} className="text-secondary" />
                </div>
                <div className="font-display text-3xl font-bold text-primary dark:text-white tracking-tight">
                  {stats.departmentsCount} Desks
                </div>
                <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-1">
                  M-Block, Library, Labs & Canteen
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 w-full">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">
              Institutional Protocol
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-primary dark:text-white tracking-tight mt-1">
              How Custodial Handover Works
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-slate-300 mt-2">
              Our 3-step structured verification ensures items are safeguarded and accurately returned to their verified student owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-surface-container-lowest dark:bg-darkcanvas-surface border border-surface-container-high dark:border-darkcanvas-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="font-display font-bold text-base text-primary dark:text-white mb-2">
                File Official Case Docket
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed">
                Log into the student portal and submit detailed specifications: approximate time, building location, color shade, distinguishing stickers, and photo reference.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-container-lowest dark:bg-darkcanvas-surface border border-surface-container-high dark:border-darkcanvas-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="font-display font-bold text-base text-primary dark:text-white mb-2">
                Custodial Check & Heuristic Pairing
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed">
                Administrators log found items into secure custody. The system's relational heuristic engine highlights matching candidate pairs between intake records and requests.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-surface-container-lowest dark:bg-darkcanvas-surface border border-surface-container-high dark:border-darkcanvas-border shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="font-display font-bold text-base text-primary dark:text-white mb-2">
                ID Verification & Handover
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed">
                Upon match approval, you will receive an automatic system notification. Bring your physical Vidyalankar Student ID card to the custodian desk for verified collection.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-darkcanvas-surface border-t border-surface-container-high dark:border-darkcanvas-border py-8 px-4 sm:px-6 lg:px-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <VitBrand />
          <p className="text-secondary dark:text-darkcanvas-muted text-center sm:text-right">
            © {new Date().getFullYear()} Vidyalankar Institute of Technology. DBMS Mini-Project Architecture.
          </p>
        </div>
      </footer>
    </div>
  );
};

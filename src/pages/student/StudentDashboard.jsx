import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import {
  FilePlus,
  Search,
  CheckCircle2,
  Clock,
  Bell,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  ChevronRight,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

export const StudentDashboard = () => {
  const { studentData, user } = useAuth();
  const [stats, setStats] = useState({
    activeRequests: 0,
    matchedItems: 0,
    collectedItems: 0,
    unreadNotifications: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);

        const { data: requests, error: reqErr } = await supabase
          .from('lost_requests')
          .select('*')
          .eq('student_id', user.id)
          .order('date_report', { ascending: false });

        if (reqErr) throw reqErr;

        const { data: notifications, error: notifErr } = await supabase
          .from('notifications')
          .select('*')
          .eq('student_id', user.id);

        if (notifErr) throw notifErr;

        const allRequests = requests || [];
        const active = allRequests.filter(
          (r) => r.status === 'Pending' || r.status === 'Under Review'
        ).length;
        const matched = allRequests.filter((r) => r.status === 'Matched').length;
        const collected = allRequests.filter((r) => r.status === 'Collected').length;
        const statusUpdatesCount = allRequests.filter((r) => r.status !== 'Pending').length;

        setStats({
          activeRequests: active,
          matchedItems: matched,
          collectedItems: collected,
          unreadNotifications: (notifications?.length || 0) + statusUpdatesCount,
        });

        setRecentRequests(allRequests.slice(0, 6));
      } catch (err) {
        console.error('Error fetching student dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Pending
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Under Review
          </span>
        );
      case 'Matched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-secondary-fixed/50 dark:bg-purple-950/50 text-on-secondary-fixed-variant dark:text-purple-300 border border-secondary-container dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            Matched Ready
          </span>
        );
      case 'Collected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Collected
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-surface-container dark:bg-darkcanvas-border text-secondary dark:text-slate-300 border border-surface-container-high dark:border-darkcanvas-border">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-surface-container text-secondary">
            {status}
          </span>
        );
    }
  };

  const displayName = studentData?.name || 'Student';

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner / Student Greeting Section */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 sm:p-6 lg:p-8 shadow-sm border border-surface-container-high dark:border-darkcanvas-border">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 sm:gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-secondary-fixed/40 dark:bg-darkcanvas-border text-on-secondary-fixed-variant dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container dark:bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Session Active • Vidyalankar Registry
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-primary dark:text-white tracking-tight">
              Welcome back, {displayName}.
            </h1>
            <p className="text-xs sm:text-sm text-secondary dark:text-slate-300 leading-relaxed">
              Track your active claims, view verified match suggestions, and manage your reported items across the Vidyalankar campus registry.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-secondary dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-secondary dark:text-slate-400" />
                Roll: <strong className="text-primary dark:text-white">{studentData?.roll_no || 'N/A'}</strong>
              </span>
              <span>•</span>
              <span>Dept: <strong className="text-primary dark:text-white">{studentData?.department || 'Engineering'}</strong></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0 [&>a]:w-full sm:[&>a]:w-auto [&>a]:justify-center">
            <Link
              to="/student/report"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-md transition active:scale-[0.99]"
            >
              <FilePlus size={15} />
              <span>Report Lost Item</span>
            </Link>
            <Link
              to="/student/found-items"
              className="inline-flex items-center gap-1.5 bg-surface-container-lowest dark:bg-darkcanvas-border hover:bg-surface-container text-primary dark:text-white font-semibold text-xs px-4 py-2.5 rounded-lg border border-surface-container-high dark:border-darkcanvas-border shadow-sm transition"
            >
              <Search size={15} />
              <span>Browse Found Items</span>
            </Link>
            <Link
              to="/student/requests"
              className="inline-flex items-center gap-1.5 bg-surface-container dark:bg-darkcanvas-border/60 hover:bg-surface-container-high text-secondary dark:text-slate-300 font-semibold text-xs px-3.5 py-2.5 rounded-lg transition"
            >
              <span>View All Requests</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Metric Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Requests */}
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-5 rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">
              Active Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container dark:bg-darkcanvas-border flex items-center justify-center text-primary dark:text-white">
              <Clock size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display font-bold text-3xl text-primary dark:text-white leading-none">
              {String(stats.activeRequests).padStart(2, '0')}
            </span>
            <span className="text-xs text-secondary dark:text-slate-400">cases in pipeline</span>
          </div>
          <div className="mt-2 pt-2 border-t border-surface-container dark:border-darkcanvas-border flex items-center gap-1.5 text-[11px] text-on-surface-variant dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Awaiting Custodial Intake Match</span>
          </div>
        </div>

        {/* Card 2: Matched Items */}
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-5 rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">
              Matched Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container dark:bg-purple-950 flex items-center justify-center text-on-secondary-container dark:text-purple-300">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display font-bold text-3xl text-purple-700 dark:text-purple-400 leading-none">
              {String(stats.matchedItems).padStart(2, '0')}
            </span>
            <span className="text-xs text-secondary dark:text-slate-400">verified matches</span>
          </div>
          <Link
            to="/student/requests"
            className="mt-2 pt-2 border-t border-surface-container dark:border-darkcanvas-border flex items-center justify-between text-[11px] text-on-secondary-fixed-variant dark:text-purple-300 font-bold hover:underline"
          >
            <span>Ready for pickup verification</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Card 3: Collected Items */}
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-5 rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">
              Collected Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container dark:bg-darkcanvas-border flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display font-bold text-3xl text-emerald-700 dark:text-emerald-400 leading-none">
              {String(stats.collectedItems).padStart(2, '0')}
            </span>
            <span className="text-xs text-secondary dark:text-slate-400">historic handovers</span>
          </div>
          <div className="mt-2 pt-2 border-t border-surface-container dark:border-darkcanvas-border text-[11px] text-secondary dark:text-slate-400">
            <span>Settled academic intake records</span>
          </div>
        </div>

        {/* Card 4: Security Alerts */}
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-5 rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">
              Security Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
              <Bell size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-display font-bold text-3xl text-primary dark:text-white leading-none">
              {String(stats.unreadNotifications).padStart(2, '0')}
            </span>
            <span className="text-xs text-secondary dark:text-slate-400">dispatches</span>
          </div>
          <Link
            to="/student/notifications"
            className="mt-2 pt-2 border-t border-surface-container dark:border-darkcanvas-border flex items-center justify-between text-[11px] text-primary dark:text-slate-300 font-semibold hover:underline"
          >
            <span>Live status telemetry feed</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* Recent Requests Table Section */}
      <section className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-surface-container dark:border-darkcanvas-border gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-primary dark:text-white" />
              <h2 className="font-display font-bold text-base text-primary dark:text-white tracking-tight">
                Active & Historic Reports
              </h2>
            </div>
            <p className="text-xs text-secondary dark:text-slate-400 mt-0.5">
              Live status log of lost belongings filed under registration {studentData?.roll_no || studentData?.email}
            </p>
          </div>
          <Link
            to="/student/requests"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-white hover:text-secondary dark:hover:text-slate-300"
          >
            <span>Full Ledger</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-secondary dark:text-slate-400">
            <div className="w-6 h-6 border-2 border-primary dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading custodial request ledger...
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-container-low dark:bg-darkcanvas-border text-secondary flex items-center justify-center mx-auto mb-3">
              <Package size={22} />
            </div>
            <h3 className="text-sm font-bold text-primary dark:text-white">
              No lost property requests logged yet
            </h3>
            <p className="text-xs text-secondary dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Have you misplaced an item on campus? Submit a lost property report to trigger automated matching.
            </p>
            <Link
              to="/student/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              <FilePlus size={14} />
              <span>Report Lost Item</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low dark:bg-darkcanvas-border/50 text-secondary dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3 sm:px-4 rounded-l whitespace-nowrap">Docket ID</th>
                  <th className="py-3 px-3 sm:px-4">Item Details</th>
                  <th className="py-3 px-3 sm:px-4 hidden md:table-cell whitespace-nowrap">Category</th>
                  <th className="py-3 px-3 sm:px-4 hidden sm:table-cell whitespace-nowrap">Date Reported</th>
                  <th className="py-3 px-3 sm:px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3 sm:px-4 text-right rounded-r whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container dark:divide-darkcanvas-border">
                {recentRequests.map((req) => (
                  <tr key={req.request_id} className="hover:bg-surface-container-low/50 dark:hover:bg-darkcanvas-border/30 transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 font-mono font-bold text-primary dark:text-white whitespace-nowrap">
                      #{req.request_id}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 min-w-[140px]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary dark:text-white">
                          {req.description?.slice(0, 40) || req.category}
                        </span>
                        {req.colour && (
                          <span className="text-[11px] text-secondary dark:text-slate-400">
                            Colour: {req.colour}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 hidden md:table-cell text-secondary dark:text-slate-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-container dark:bg-darkcanvas-border text-[11px] font-medium">
                        {req.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 hidden sm:table-cell text-secondary dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {req.date_report}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                      <Link
                        to="/student/requests"
                        className="inline-flex items-center gap-1 font-bold text-primary dark:text-white hover:underline text-xs"
                      >
                        <span>Details</span>
                        <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

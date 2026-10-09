import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  FileText,
  Clock,
  CheckCircle,
  Package,
  Users,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Database,
  Plus,
  GitMerge
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddFoundItemModal } from './AddFoundItemModal';

export const AdminOverviewPage = () => {
  const [stats, setStats] = useState({
    totalLost: 0,
    pendingLost: 0,
    underReviewLost: 0,
    matchedLost: 0,
    collectedLost: 0,
    totalFound: 0,
    unclaimedFound: 0,
    totalStudents: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddFoundModal, setShowAddFoundModal] = useState(false);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);

      const { data: lostData, error: lostErr } = await supabase
        .from('lost_requests')
        .select('*');

      if (lostErr) throw lostErr;

      const { data: foundData, error: foundErr } = await supabase
        .from('found_items')
        .select('*');

      if (foundErr) throw foundErr;

      const { data: studentsData, error: studentsErr } = await supabase
        .from('students')
        .select('student_id', { count: 'exact' });

      if (studentsErr) throw studentsErr;

      const lost = lostData || [];
      const found = foundData || [];

      setStats({
        totalLost: lost.length,
        pendingLost: lost.filter((r) => r.status === 'Pending').length,
        underReviewLost: lost.filter((r) => r.status === 'Under Review').length,
        matchedLost: lost.filter((r) => r.status === 'Matched').length,
        collectedLost: lost.filter((r) => r.status === 'Collected').length,
        totalFound: found.length,
        unclaimedFound: found.filter((f) => f.status === 'Unclaimed').length,
        totalStudents: studentsData?.length || 0,
      });

      setRecentRequests(
        [...lost]
          .sort((a, b) => new Date(b.date_report) - new Date(a.date_report))
          .slice(0, 5)
      );
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* Overview Banner */}
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface border border-surface-container-high dark:border-darkcanvas-border rounded-xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-secondary-fixed/40 dark:bg-darkcanvas-border text-on-secondary-fixed-variant dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Database size={13} />
            <span>PostgreSQL Relational Telemetry</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-primary dark:text-white tracking-tight">
            Vidyalankar Custodial Operations Overview
          </h1>
          <p className="text-secondary dark:text-slate-300 text-xs mt-1">
            Real-time aggregate data queried directly from <code>lost_requests</code>, <code>found_items</code>, and <code>students</code>.
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={() => setShowAddFoundModal(true)}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Log Found Item</span>
          </button>
          <Link
            to="/admin/match-management"
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-darkcanvas-border transition flex items-center gap-1.5"
          >
            <GitMerge size={15} />
            <span>Match Portal →</span>
          </Link>
        </div>
      </div>

      {/* 8 Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm">
          <p className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">Total Lost Requests</p>
          <h3 className="font-display font-bold text-2xl text-primary dark:text-white mt-1">{stats.totalLost}</h3>
          <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">Reported by students</p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-amber-300 dark:border-amber-900/60 shadow-sm">
          <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pending Requests</p>
          <h3 className="font-display font-bold text-2xl text-amber-600 dark:text-amber-400 mt-1">{stats.pendingLost}</h3>
          <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">Awaiting admin review</p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-blue-300 dark:border-blue-900/60 shadow-sm">
          <p className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Under Review</p>
          <h3 className="font-display font-bold text-2xl text-blue-600 dark:text-blue-400 mt-1">{stats.underReviewLost}</h3>
          <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">Admin assigned</p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-purple-300 dark:border-purple-900/60 shadow-sm">
          <p className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Matched Items</p>
          <h3 className="font-display font-bold text-2xl text-purple-600 dark:text-purple-400 mt-1">{stats.matchedLost}</h3>
          <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">Ready for pickup</p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-emerald-300 dark:border-emerald-900/60 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Collected / Restored</p>
          <h3 className="font-display font-bold text-2xl text-emerald-600 dark:text-emerald-400 mt-1">{stats.collectedLost}</h3>
          <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">Successfully handed over</p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm">
          <p className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">Total Found Items</p>
          <h3 className="font-display font-bold text-2xl text-primary dark:text-white mt-1">{stats.totalFound}</h3>
          <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">In university custody</p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm">
          <p className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">Unclaimed Items</p>
          <h3 className="font-display font-bold text-2xl text-primary dark:text-white mt-1">{stats.unclaimedFound}</h3>
          <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">In storage safe</p>
        </div>

        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm">
          <p className="text-[11px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider">Registered Students</p>
          <h3 className="font-display font-bold text-2xl text-primary dark:text-white mt-1">{stats.totalStudents}</h3>
          <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">VIT domain users</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-container dark:border-darkcanvas-border flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-sm text-primary dark:text-white">
              Recent Lost Item Inquiries
            </h2>
            <p className="text-xs text-secondary dark:text-slate-400">
              Latest requests reported across academic departments
            </p>
          </div>
          <Link
            to="/admin/lost-requests"
            className="text-xs font-bold text-primary dark:text-white hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low dark:bg-darkcanvas-border/50 text-[10px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400 border-b border-surface-container dark:border-darkcanvas-border">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6">Reported Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container dark:divide-darkcanvas-border">
              {recentRequests.map((r) => (
                <tr key={r.request_id} className="hover:bg-surface-container-low/40 dark:hover:bg-darkcanvas-border/30 transition">
                  <td className="py-3.5 px-6 font-mono font-bold text-primary dark:text-white">
                    #{r.request_id}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-primary dark:text-white">
                    {r.category}
                  </td>
                  <td className="py-3.5 px-6 text-on-surface-variant dark:text-slate-300 max-w-xs truncate">
                    {r.description}
                  </td>
                  <td className="py-3.5 px-6 text-secondary dark:text-slate-400 font-mono text-[11px]">
                    {r.date_report}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-surface-container dark:bg-darkcanvas-border text-secondary dark:text-slate-300">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      to="/admin/lost-requests"
                      className="font-bold text-primary dark:text-white hover:underline text-xs"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddFoundItemModal
        isOpen={showAddFoundModal}
        onClose={() => setShowAddFoundModal(false)}
        onItemAdded={() => fetchOverviewData()}
      />
    </div>
  );
};

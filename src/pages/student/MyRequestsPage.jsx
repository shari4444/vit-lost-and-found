import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import {
  FileText,
  Filter,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  PackageCheck,
  Building,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const MyRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lost_requests')
        .select('*')
        .eq('student_id', user.id)
        .order('date_report', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (req) => {
    setSelectedRequest(req);
    setMatchDetails(null);

    if (req.status === 'Matched' || req.status === 'Collected') {
      try {
        const { data, error } = await supabase
          .from('item_matches')
          .select(`
            match_id,
            match_date,
            found_items (
              found_id,
              category,
              colour,
              location,
              date_found,
              photo_url
            )
          `)
          .eq('request_id', req.request_id)
          .maybeSingle();

        if (!error && data) {
          setMatchDetails(data);
        }
      } catch (err) {
        console.error('Error fetching match details:', err);
      }
    }
  };

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-surface-container dark:bg-darkcanvas-border text-secondary dark:text-slate-300">
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

  const renderProgression = (status) => {
    const steps = ['Pending', 'Under Review', 'Matched', 'Collected'];
    let activeIndex = steps.indexOf(status);
    if (status === 'Closed') activeIndex = 3;

    return (
      <div className="py-3">
        <p className="text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-3">
          Lifecycle Progression
        </p>
        <div className="flex items-center justify-between w-full relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-container dark:bg-darkcanvas-border -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
            style={{
              width: `${(Math.max(0, activeIndex) / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 shadow-md'
                      : isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-darkcanvas-bg text-slate-400 border border-darkcanvas-border'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] mt-1 font-semibold text-center leading-tight max-w-[65px] sm:max-w-none ${
                    isCurrent
                      ? 'text-primary dark:text-white font-bold'
                      : isCompleted
                      ? 'text-on-surface dark:text-slate-200'
                      : 'text-secondary dark:text-slate-500'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const filtered = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container dark:border-darkcanvas-border">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
            Student Docket History
          </span>
          <h1 className="font-display font-bold text-2xl text-primary dark:text-white tracking-tight mt-0.5">
            My Lost Property Requests
          </h1>
          <p className="text-xs text-secondary dark:text-slate-400">
            Real-time status tracking governed by PostgreSQL RLS security.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-secondary" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-surface-container-lowest dark:bg-darkcanvas-surface border border-surface-container-high dark:border-darkcanvas-border rounded-lg px-3 py-2 text-on-surface dark:text-white font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses ({requests.length})</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Matched">Matched</option>
            <option value="Collected">Collected</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-secondary text-xs">
            <div className="w-6 h-6 border-2 border-primary dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading your requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-container-low dark:bg-darkcanvas-border text-secondary flex items-center justify-center mx-auto mb-3">
              <FileText size={22} />
            </div>
            <h3 className="text-sm font-bold text-primary dark:text-white">
              No requests matching criteria
            </h3>
            <p className="text-xs text-secondary dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Need to file a missing item report? Create a new submission anytime.
            </p>
            <Link
              to="/student/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              Report Lost Item
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low dark:bg-darkcanvas-border/50 text-[10px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400 border-b border-surface-container dark:border-darkcanvas-border">
                  <th className="py-3 px-3.5 sm:px-6 whitespace-nowrap">Docket #</th>
                  <th className="py-3 px-3.5 sm:px-6 whitespace-nowrap">Photo</th>
                  <th className="py-3 px-3.5 sm:px-6 whitespace-nowrap">Category</th>
                  <th className="py-3 px-3.5 sm:px-6">Description</th>
                  <th className="py-3 px-3.5 sm:px-6 whitespace-nowrap">Reported Date</th>
                  <th className="py-3 px-3.5 sm:px-6 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3.5 sm:px-6 text-right whitespace-nowrap">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container dark:divide-darkcanvas-border">
                {filtered.map((req) => (
                  <tr
                    key={req.request_id}
                    className="hover:bg-surface-container-low/50 dark:hover:bg-darkcanvas-border/30 transition cursor-pointer"
                    onClick={() => handleOpenDetail(req)}
                  >
                    <td className="py-4 px-3.5 sm:px-6 font-mono font-bold text-primary dark:text-white whitespace-nowrap">
                      #{req.request_id}
                    </td>
                    <td className="py-4 px-3.5 sm:px-6 whitespace-nowrap">
                      {req.photo_url ? (
                        <img
                          src={req.photo_url}
                          alt="Thumbnail"
                          className="w-10 h-10 object-cover rounded-lg border border-surface-container-high dark:border-darkcanvas-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-container dark:bg-darkcanvas-border text-secondary flex items-center justify-center text-[10px] font-medium">
                          No Pic
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3.5 sm:px-6 font-semibold text-primary dark:text-white whitespace-nowrap">
                      {req.category}
                      {req.colour && (
                        <span className="block text-[11px] text-secondary dark:text-slate-400 font-normal">
                          {req.colour}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3.5 sm:px-6 text-on-surface-variant dark:text-slate-300 max-w-xs truncate min-w-[120px]">
                      {req.description}
                    </td>
                    <td className="py-4 px-3.5 sm:px-6 text-secondary dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {req.date_report}
                    </td>
                    <td className="py-4 px-3.5 sm:px-6 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                    <td className="py-4 px-3.5 sm:px-6 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(req);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-white hover:underline"
                      >
                        <span>View</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-surface-container-high dark:border-darkcanvas-border space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-surface-container dark:border-darkcanvas-border pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-secondary dark:text-slate-400">
                  DOCKET #{selectedRequest.request_id}
                </span>
                <h3 className="font-display font-bold text-base text-primary dark:text-white">
                  {selectedRequest.category}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-secondary hover:text-primary dark:hover:text-white hover:bg-surface-container dark:hover:bg-darkcanvas-border"
              >
                <X size={18} />
              </button>
            </div>

            {renderProgression(selectedRequest.status)}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {selectedRequest.photo_url && (
                <div className="sm:col-span-2">
                  <img
                    src={selectedRequest.photo_url}
                    alt="Item"
                    className="w-full h-44 object-cover rounded-lg border border-surface-container-high dark:border-darkcanvas-border"
                  />
                </div>
              )}

              <div className="p-3 rounded-lg bg-surface-container-low dark:bg-darkcanvas-bg space-y-1">
                <span className="text-secondary dark:text-slate-400 block text-[10px] font-bold uppercase">
                  Reported Date
                </span>
                <span className="font-mono text-primary dark:text-white">{selectedRequest.date_report}</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low dark:bg-darkcanvas-bg space-y-1">
                <span className="text-secondary dark:text-slate-400 block text-[10px] font-bold uppercase">
                  Primary Colour
                </span>
                <span className="text-primary dark:text-white font-medium">{selectedRequest.colour || 'Not specified'}</span>
              </div>

              <div className="sm:col-span-2 p-3 rounded-lg bg-surface-container-low dark:bg-darkcanvas-bg space-y-1">
                <span className="text-secondary dark:text-slate-400 block text-[10px] font-bold uppercase">
                  Narrative Description
                </span>
                <p className="text-on-surface-variant dark:text-slate-300 leading-relaxed">
                  {selectedRequest.description}
                </p>
              </div>
            </div>

            {/* Matched Details Banner */}
            {matchDetails && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 space-y-2">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs">
                  <CheckCircle2 size={16} />
                  <span>Item Matched by Campus Custodian!</span>
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
                  A matching found item was registered (Found Item #{matchDetails.found_items?.found_id}) at{' '}
                  <span className="font-bold">{matchDetails.found_items?.location || 'Central Admin Office'}</span>.
                  Please bring your physical Vidyalankar Student ID to claim it.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-surface-container dark:border-darkcanvas-border flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-surface-container-high dark:bg-darkcanvas-border hover:bg-surface-variant text-on-surface dark:text-white text-xs font-semibold rounded-lg transition"
              >
                Close Docket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

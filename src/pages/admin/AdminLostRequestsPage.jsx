import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Search,
  Filter,
  CheckCircle,
  Eye,
  X,
  ShieldCheck,
  User,
  Calendar,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLostRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [adminsMap, setAdminsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequestsAndProfiles = async () => {
    try {
      setLoading(true);

      const { data: lostData, error: lostErr } = await supabase
        .from('lost_requests')
        .select('*')
        .order('date_report', { ascending: false });

      if (lostErr) throw lostErr;

      const { data: studentsData } = await supabase.from('students').select('*');
      const sMap = {};
      (studentsData || []).forEach((s) => {
        sMap[s.student_id] = s;
      });
      setStudentsMap(sMap);

      const { data: adminsData } = await supabase.from('admins').select('*');
      const aMap = {};
      (adminsData || []).forEach((a) => {
        aMap[a.admin_id] = a;
      });
      setAdminsMap(aMap);

      setRequests(lostData || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsAndProfiles();
  }, []);

  const handleOpenReviewModal = (req) => {
    setSelectedRequest(req);
    setNewStatus(req.status);
    setStatusMessage('');
  };

  const handleUpdateStatusAndAssign = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !user) return;

    setStatusUpdating(true);
    setStatusMessage('');

    try {
      const { data, error } = await supabase
        .from('lost_requests')
        .update({
          status: newStatus,
          reviewed_by: user.id,
        })
        .eq('request_id', selectedRequest.request_id)
        .select()
        .single();

      if (error) throw error;

      if (newStatus !== selectedRequest.status) {
        const { data: existingMatch } = await supabase
          .from('item_matches')
          .select('match_id')
          .eq('request_id', selectedRequest.request_id)
          .maybeSingle();

        if (existingMatch) {
          let notifMessage = `Your lost property docket #${selectedRequest.request_id} (${selectedRequest.category}) status changed to '${newStatus}'.`;
          if (newStatus === 'Under Review') {
            notifMessage = `Administrative proctor has started review on your lost item #${selectedRequest.request_id}.`;
          } else if (newStatus === 'Collected') {
            notifMessage = `Your item #${selectedRequest.request_id} has been marked as COLLECTED and handed over.`;
          }

          await supabase.from('notifications').insert({
            student_id: selectedRequest.student_id,
            match_id: existingMatch.match_id,
            message: notifMessage,
            email_status: 'Sent',
          });
        }
      }

      setStatusMessage('Status and reviewer assigned successfully!');
      setSelectedRequest(data);
      fetchRequestsAndProfiles();
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setStatusUpdating(false);
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
            Matched
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-surface-container dark:bg-darkcanvas-border text-secondary dark:text-slate-400">
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

  const filtered = requests.filter((r) => {
    const student = studentsMap[r.student_id];
    const matchesFilter = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.colour && r.colour.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student && student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-2 border-b border-surface-container dark:border-darkcanvas-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
          Custodial Docket Management
        </span>
        <h1 className="font-display font-bold text-2xl text-primary dark:text-white tracking-tight mt-0.5">
          Student Lost Property Requests
        </h1>
        <p className="text-xs text-secondary dark:text-slate-400">
          Review claims, assign administrator UUID reviewership, and modify case lifecycle states.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="text-secondary dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, category, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg text-xs text-on-surface dark:text-white placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary-container"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-secondary" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg px-3 py-2 text-xs text-on-surface dark:text-white font-medium focus:outline-none"
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

      {/* Main Table */}
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-secondary text-xs">
            <div className="w-6 h-6 border-2 border-primary dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading lost property requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-secondary text-xs">No matching requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low dark:bg-darkcanvas-border/50 text-secondary dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-surface-container dark:border-darkcanvas-border">
                  <th className="py-3 px-3 sm:px-5 whitespace-nowrap">ID</th>
                  <th className="py-3 px-3 sm:px-5">Student</th>
                  <th className="py-3 px-3 sm:px-5">Category & Details</th>
                  <th className="py-3 px-3 sm:px-5 whitespace-nowrap">Date Reported</th>
                  <th className="py-3 px-3 sm:px-5 whitespace-nowrap">Status</th>
                  <th className="py-3 px-3 sm:px-5 whitespace-nowrap">Reviewed By</th>
                  <th className="py-3 px-3 sm:px-5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container dark:divide-darkcanvas-border">
                {filtered.map((req) => {
                  const student = studentsMap[req.student_id];
                  const reviewer = adminsMap[req.reviewed_by];

                  return (
                    <tr key={req.request_id} className="hover:bg-surface-container-low/40 dark:hover:bg-darkcanvas-border/30 transition">
                      <td className="py-3.5 px-3 sm:px-5 font-mono font-bold text-primary dark:text-white whitespace-nowrap">
                        #{req.request_id}
                      </td>
                      <td className="py-3.5 px-3 sm:px-5 min-w-[130px]">
                        <div className="font-semibold text-primary dark:text-white">
                          {student?.name || 'Student'}
                        </div>
                        <div className="text-[11px] text-secondary dark:text-slate-400 font-mono">
                          {student?.roll_no || req.student_id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 sm:px-5 min-w-[140px]">
                        <span className="font-semibold text-primary dark:text-white">{req.category}</span>
                        {req.colour && (
                          <span className="block text-[11px] text-secondary dark:text-slate-400">
                            {req.colour}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 sm:px-5 text-secondary dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {req.date_report}
                      </td>
                      <td className="py-3.5 px-3 sm:px-5 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                      <td className="py-3.5 px-3 sm:px-5 whitespace-nowrap">
                        {reviewer ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-white">
                            <ShieldCheck size={12} className="text-secondary" />
                            {reviewer.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-secondary dark:text-slate-500 italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 sm:px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReviewModal(req)}
                          className="px-3 py-1 bg-surface-container dark:bg-darkcanvas-border hover:bg-surface-container-high rounded text-xs font-bold text-primary dark:text-white transition"
                        >
                          Review & Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Assign Status Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface border border-surface-container-high dark:border-darkcanvas-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-surface-container dark:border-darkcanvas-border pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-secondary dark:text-slate-400">
                  DOCKET #{selectedRequest.request_id}
                </span>
                <h3 className="font-display font-bold text-base text-primary dark:text-white">
                  Review & Assign Status
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-secondary hover:text-primary dark:hover:text-white hover:bg-surface-container dark:hover:bg-darkcanvas-border"
              >
                <X size={18} />
              </button>
            </div>

            {statusMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                {statusMessage}
              </div>
            )}

            {/* Request Summary */}
            <div className="p-3.5 rounded-lg bg-surface-container-low dark:bg-darkcanvas-bg space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-secondary dark:text-slate-400">Student Claimant:</span>
                <span className="font-bold text-primary dark:text-white">
                  {studentsMap[selectedRequest.student_id]?.name || 'N/A'} ({studentsMap[selectedRequest.student_id]?.roll_no || 'N/A'})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary dark:text-slate-400">Category & Color:</span>
                <span className="text-primary dark:text-white font-medium">
                  {selectedRequest.category} • {selectedRequest.colour || '—'}
                </span>
              </div>
              <div>
                <span className="text-secondary dark:text-slate-400 block mb-0.5">Narrative:</span>
                <p className="text-on-surface-variant dark:text-slate-300">{selectedRequest.description}</p>
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateStatusAndAssign} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1.5">
                  Update Lifecycle Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg text-xs text-on-surface dark:text-white focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Matched">Matched</option>
                  <option value="Collected">Collected</option>
                  <option value="Closed">Closed</option>
                </select>
                <p className="text-[11px] text-secondary dark:text-slate-400 mt-1">
                  Assigns your admin ID (<code>reviewed_by = {user?.id?.slice(0, 8)}...</code>) and dispatches automated student notification.
                </p>
              </div>

              <div className="pt-3 border-t border-surface-container dark:border-darkcanvas-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container dark:bg-darkcanvas-border hover:bg-surface-container-high text-xs font-semibold text-secondary dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {statusUpdating ? 'Saving...' : 'Save & Assign Reviewer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

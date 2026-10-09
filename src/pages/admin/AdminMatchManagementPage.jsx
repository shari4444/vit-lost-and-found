import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import {
  GitMerge,
  Search,
  CheckCircle,
  AlertCircle,
  Plus,
  ShieldCheck,
  Sliders,
  ArrowLeftRight,
  CheckCheck,
  Sparkles,
  Calendar,
  MapPin,
  Tag,
  Check,
  X,
  Printer,
  ChevronRight,
  Layers
} from 'lucide-react';
import { AddFoundItemModal } from './AddFoundItemModal';

export const AdminMatchManagementPage = () => {
  const { user } = useAuth();
  const [lostRequests, setLostRequests] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [matchesList, setMatchesList] = useState([]);

  const [selectedLost, setSelectedLost] = useState(null);
  const [selectedFound, setSelectedFound] = useState(null);

  const [loading, setLoading] = useState(true);
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [showAddFoundModal, setShowAddFoundModal] = useState(false);

  // Search filters
  const [lostSearch, setLostSearch] = useState('');
  const [foundSearch, setFoundSearch] = useState('');

  const loadMatchData = async () => {
    try {
      setLoading(true);

      const { data: lost, error: lostErr } = await supabase
        .from('lost_requests')
        .select('*')
        .order('date_report', { ascending: false });

      if (lostErr) throw lostErr;

      const { data: found, error: foundErr } = await supabase
        .from('found_items')
        .select('*')
        .order('date_found', { ascending: false });

      if (foundErr) throw foundErr;

      const { data: students } = await supabase.from('students').select('*');
      const sMap = {};
      (students || []).forEach((s) => {
        sMap[s.student_id] = s;
      });
      setStudentsMap(sMap);

      const { data: matches, error: matchErr } = await supabase
        .from('item_matches')
        .select(`
          match_id,
          request_id,
          found_id,
          match_date,
          lost_requests (category, colour, description, student_id),
          found_items (category, colour, location)
        `)
        .order('match_date', { ascending: false });

      if (matchErr) throw matchErr;

      setLostRequests(lost || []);
      setFoundItems(found || []);
      setMatchesList(matches || []);

      // Auto-select first pair if available
      if (lost && lost.length > 0 && !selectedLost) {
        setSelectedLost(lost[0]);
      }
      if (found && found.length > 0 && !selectedFound) {
        setSelectedFound(found[0]);
      }
    } catch (err) {
      console.error('Error loading match data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatchData();
  }, []);

  // Compute heuristic confidence between selected lost & found
  const calculateHeuristicScore = () => {
    if (!selectedLost || !selectedFound) return { score: 0, factors: [] };

    let score = 30; // Baseline
    const factors = [];

    // Category check
    if (selectedLost.category && selectedFound.category) {
      if (selectedLost.category.toLowerCase() === selectedFound.category.toLowerCase()) {
        score += 35;
        factors.push({ label: 'Category exact match', match: true });
      } else {
        factors.push({ label: 'Category divergence', match: false });
      }
    }

    // Colour check
    if (selectedLost.colour && selectedFound.colour) {
      const lostCol = selectedLost.colour.toLowerCase();
      const foundCol = selectedFound.colour.toLowerCase();
      if (lostCol.includes(foundCol) || foundCol.includes(lostCol)) {
        score += 20;
        factors.push({ label: 'Color shade match', match: true });
      } else {
        factors.push({ label: 'Color variance', match: false });
      }
    } else {
      factors.push({ label: 'Color unspecified', match: null });
    }

    // Temporal proximity
    if (selectedLost.date_report && selectedFound.date_found) {
      const d1 = new Date(selectedLost.date_report);
      const d2 = new Date(selectedFound.date_found);
      const diffDays = Math.abs((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        score += 15;
        factors.push({ label: 'Temporal window ≤ 7 days', match: true });
      } else {
        factors.push({ label: `Logged ${Math.round(diffDays)}d apart`, match: false });
      }
    }

    return { score: Math.min(score, 98), factors };
  };

  const heuristic = calculateHeuristicScore();

  const handleExecuteMatch = async () => {
    if (!selectedLost || !selectedFound) {
      setStatusMessage({
        text: 'Please select both a Lost Request and a Found Item before pairing.',
        type: 'error',
      });
      return;
    }

    setMatchingInProgress(true);
    setStatusMessage({ text: '', type: '' });

    try {
      const { data: matchId, error: rpcErr } = await supabase.rpc('create_match', {
        p_request_id: selectedLost.request_id,
        p_found_id: selectedFound.found_id,
      });

      if (rpcErr) {
        if (rpcErr.message?.includes('unique') || rpcErr.message?.includes('duplicate')) {
          throw new Error('This Lost Request and Found Item are already paired in item_matches.');
        }
        throw rpcErr;
      }

      setStatusMessage({
        text: `Match #${matchId} successfully executed! Automated notification dispatched to student profile.`,
        type: 'success',
      });

      await loadMatchData();
    } catch (err) {
      console.error('RPC Error:', err);
      setStatusMessage({
        text: err.message || 'Failed to execute create_match() RPC function.',
        type: 'error',
      });
    } finally {
      setMatchingInProgress(false);
    }
  };

  const filteredLost = lostRequests.filter((r) => {
    const q = lostSearch.toLowerCase();
    return (
      r.description?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      String(r.request_id).includes(q)
    );
  });

  const filteredFound = foundItems.filter((f) => {
    const q = foundSearch.toLowerCase();
    return (
      f.description?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q) ||
      f.location?.toLowerCase().includes(q) ||
      String(f.found_id).includes(q)
    );
  });

  const currentStudent = selectedLost ? studentsMap[selectedLost.student_id] : null;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Operational Banner & Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-surface-container dark:border-darkcanvas-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
              Registry Operations
            </span>
            <span className="text-secondary text-xs">•</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-white">
              Automated Heuristic Engine v2.4
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-primary dark:text-white tracking-tight">
            Match Management Console
          </h1>
          <p className="text-xs sm:text-sm text-secondary dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Review automated candidate pairings between Student Lost Requests and Intake Found Items. Evaluate corroborative telemetry before confirming custody release.
          </p>
        </div>

        <button
          onClick={() => setShowAddFoundModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-md transition self-start lg:self-auto"
        >
          <Plus size={15} />
          <span>+ Log New Found Item</span>
        </button>
      </div>

      {/* Key Metrics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-5 rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
              Pending Lost Reports
            </span>
            <span className="font-display font-bold text-3xl text-primary dark:text-white mt-1">
              {String(lostRequests.filter((l) => l.status === 'Pending').length).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-secondary dark:text-slate-400 mt-0.5">
              Awaiting verified custodian match
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <ArrowLeftRight size={22} />
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-5 rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
              Confirmed Handover Pairs
            </span>
            <span className="font-display font-bold text-3xl text-emerald-700 dark:text-emerald-400 mt-1">
              {String(matchesList.length).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-secondary dark:text-slate-400 mt-0.5">
              Verified in item_matches ledger
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCheck size={22} />
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-5 rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
              Algorithm Acceptance Floor
            </span>
            <span className="font-display font-bold text-3xl text-primary dark:text-white mt-1">
              75%<span className="text-sm font-normal text-secondary ml-1">+</span>
            </span>
            <span className="text-[11px] text-secondary dark:text-slate-400 mt-0.5">
              Location-proximity & lexical matching
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-secondary-container dark:bg-purple-950/50 flex items-center justify-center text-on-secondary-container dark:text-purple-300 border border-secondary dark:border-purple-800">
            <Sliders size={22} />
          </div>
        </div>
      </div>

      {/* Dynamic Status / Success Toast Banner */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 shadow-sm transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-950 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {statusMessage.type === 'success' ? (
              <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-600 shrink-0" />
            )}
            <p className="text-xs font-semibold leading-relaxed">{statusMessage.text}</p>
          </div>
          {statusMessage.type === 'success' && (
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} />
              <span>Print Slip</span>
            </button>
          )}
        </div>
      )}

      {/* Candidate Pickers (Lost vs Found) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Lost Requests Picker */}
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container dark:border-darkcanvas-border">
            <div>
              <h2 className="text-sm font-bold text-primary dark:text-white flex items-center gap-2">
                <span>1. Select Student Lost Request</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container dark:bg-darkcanvas-border text-secondary dark:text-slate-300 font-bold">
                  {lostRequests.length} Total
                </span>
              </h2>
              <p className="text-[11px] text-secondary dark:text-slate-400">Claims logged by students</p>
            </div>
            {selectedLost && (
              <span className="text-xs font-mono font-bold text-primary dark:text-white px-2 py-0.5 rounded bg-surface-container dark:bg-darkcanvas-border">
                #{selectedLost.request_id}
              </span>
            )}
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-secondary dark:text-slate-400" />
            <input
              type="text"
              value={lostSearch}
              onChange={(e) => setLostSearch(e.target.value)}
              placeholder="Search lost docket #, category, description..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg border border-surface-container-high dark:border-darkcanvas-border focus:outline-none"
            />
          </div>

          <div className="flex-1 max-h-72 overflow-y-auto space-y-2 pr-1">
            {filteredLost.map((req) => {
              const isSelected = selectedLost?.request_id === req.request_id;
              const stu = studentsMap[req.student_id];
              return (
                <div
                  key={req.request_id}
                  onClick={() => setSelectedLost(req)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-secondary-fixed/30 dark:bg-slate-800 border-primary-container dark:border-white ring-1 ring-primary-container dark:ring-white'
                      : 'bg-surface-container-low/40 dark:bg-darkcanvas-bg/60 border-surface-container-high dark:border-darkcanvas-border hover:border-outline'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-primary dark:text-white">
                      #{req.request_id} • {req.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container dark:bg-darkcanvas-border text-secondary dark:text-slate-300">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary dark:text-slate-400 font-medium">
                    Claimant: {stu?.name || 'Student'} ({stu?.roll_no || 'N/A'})
                  </p>
                  <p className="text-[11px] text-on-surface-variant dark:text-slate-300 mt-1 line-clamp-1">
                    {req.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Found Items Picker */}
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container dark:border-darkcanvas-border">
            <div>
              <h2 className="text-sm font-bold text-primary dark:text-white flex items-center gap-2">
                <span>2. Select Custodial Found Item</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container dark:bg-darkcanvas-border text-secondary dark:text-slate-300 font-bold">
                  {foundItems.length} Total
                </span>
              </h2>
              <p className="text-[11px] text-secondary dark:text-slate-400">Physical articles secured on campus</p>
            </div>
            {selectedFound && (
              <span className="text-xs font-mono font-bold text-primary dark:text-white px-2 py-0.5 rounded bg-surface-container dark:bg-darkcanvas-border">
                #{selectedFound.found_id}
              </span>
            )}
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-secondary dark:text-slate-400" />
            <input
              type="text"
              value={foundSearch}
              onChange={(e) => setFoundSearch(e.target.value)}
              placeholder="Search found ID, location, category..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg border border-surface-container-high dark:border-darkcanvas-border focus:outline-none"
            />
          </div>

          <div className="flex-1 max-h-72 overflow-y-auto space-y-2 pr-1">
            {filteredFound.map((item) => {
              const isSelected = selectedFound?.found_id === item.found_id;
              return (
                <div
                  key={item.found_id}
                  onClick={() => setSelectedFound(item)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-secondary-fixed/30 dark:bg-slate-800 border-primary-container dark:border-white ring-1 ring-primary-container dark:ring-white'
                      : 'bg-surface-container-low/40 dark:bg-darkcanvas-bg/60 border-surface-container-high dark:border-darkcanvas-border hover:border-outline'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-primary dark:text-white">
                      #{item.found_id} • {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container dark:bg-darkcanvas-border text-secondary dark:text-slate-300">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary dark:text-slate-400 font-medium">
                    Locker Location: {item.location || 'Admin Office'}
                  </p>
                  <p className="text-[11px] text-on-surface-variant dark:text-slate-300 mt-1 line-clamp-1">
                    {item.description || 'No description logged.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Workspace & Heuristic Confidence */}
      {selectedLost && selectedFound && (
        <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-container dark:border-darkcanvas-border gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
                Corroborative Telemetry Comparison
              </span>
              <h3 className="font-display font-bold text-lg text-primary dark:text-white">
                Request #{selectedLost.request_id} ⟷ Found Item #{selectedFound.found_id}
              </h3>
            </div>

            {/* Heuristic Meter Badge */}
            <div className="flex items-center gap-3 bg-surface-container-low dark:bg-darkcanvas-bg p-2.5 rounded-lg border border-surface-container dark:border-darkcanvas-border">
              <Sparkles size={18} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <span className="text-[11px] text-secondary dark:text-slate-400 block font-medium">
                  Confidence Score
                </span>
                <span className="font-display font-bold text-base text-primary dark:text-white">
                  {heuristic.score}% Compatibility
                </span>
              </div>
            </div>
          </div>

          {/* Dual Panel Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Panel: Lost Docket */}
            <div className="p-4 rounded-xl bg-surface-container-low/50 dark:bg-darkcanvas-bg border border-surface-container dark:border-darkcanvas-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
                  Claimant Request #{selectedLost.request_id}
                </span>
                <span className="text-xs font-semibold text-primary dark:text-white">
                  Student: {currentStudent?.name || 'N/A'} ({currentStudent?.roll_no || 'N/A'})
                </span>
              </div>

              {selectedLost.photo_url && (
                <img
                  src={selectedLost.photo_url}
                  alt="Claimant reference"
                  className="w-full h-40 object-cover rounded-lg border border-surface-container-high dark:border-darkcanvas-border"
                />
              )}

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-secondary dark:text-slate-400 block text-[10px]">Category</span>
                  <span className="font-bold text-primary dark:text-white">{selectedLost.category}</span>
                </div>
                <div>
                  <span className="text-secondary dark:text-slate-400 block text-[10px]">Reported Color</span>
                  <span className="font-bold text-primary dark:text-white">{selectedLost.colour || '—'}</span>
                </div>
                <div>
                  <span className="text-secondary dark:text-slate-400 block text-[10px]">Date Reported</span>
                  <span className="font-mono text-primary dark:text-white">{selectedLost.date_report}</span>
                </div>
                <div>
                  <span className="text-secondary dark:text-slate-400 block text-[10px]">Status</span>
                  <span className="font-bold text-primary dark:text-white">{selectedLost.status}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-container dark:border-darkcanvas-border">
                <span className="text-[10px] text-secondary dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                  Student Narrative
                </span>
                <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed">
                  {selectedLost.description}
                </p>
              </div>
            </div>

            {/* Right Panel: Found Intake */}
            <div className="p-4 rounded-xl bg-surface-container-low/50 dark:bg-darkcanvas-bg border border-surface-container dark:border-darkcanvas-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
                  Custody Intake #{selectedFound.found_id}
                </span>
                <span className="text-xs font-semibold text-primary dark:text-white">
                  Location: {selectedFound.location || 'Admin Office'}
                </span>
              </div>

              {selectedFound.photo_url && (
                <img
                  src={selectedFound.photo_url}
                  alt="Custody intake photo"
                  className="w-full h-40 object-cover rounded-lg border border-surface-container-high dark:border-darkcanvas-border"
                />
              )}

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-secondary dark:text-slate-400 block text-[10px]">Category</span>
                  <span className="font-bold text-primary dark:text-white">{selectedFound.category}</span>
                </div>
                <div>
                  <span className="text-secondary dark:text-slate-400 block text-[10px]">Intake Color</span>
                  <span className="font-bold text-primary dark:text-white">{selectedFound.colour || '—'}</span>
                </div>
                <div>
                  <span className="text-secondary dark:text-slate-400 block text-[10px]">Date Found</span>
                  <span className="font-mono text-primary dark:text-white">{selectedFound.date_found}</span>
                </div>
                <div>
                  <span className="text-secondary dark:text-slate-400 block text-[10px]">Status</span>
                  <span className="font-bold text-primary dark:text-white">{selectedFound.status}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-surface-container dark:border-darkcanvas-border">
                <span className="text-[10px] text-secondary dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                  Finder / Custodian Notes
                </span>
                <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed">
                  {selectedFound.description || 'No additional custodian notes logged.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-surface-container dark:border-darkcanvas-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-secondary dark:text-slate-400">
              <ShieldCheck size={16} className="text-secondary" />
              <span>
                Executes PostgreSQL atomic procedure <code>create_match()</code>, sets both statuses to 'Matched', and generates student alert.
              </span>
            </div>

            <button
              onClick={handleExecuteMatch}
              disabled={matchingInProgress}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {matchingInProgress ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <GitMerge size={15} />
                  <span>Execute Pair & Dispatch Alert</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Verified Junction Matches Ledger */}
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl shadow-sm border border-surface-container-high dark:border-darkcanvas-border overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-container dark:border-darkcanvas-border flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-primary dark:text-white">
              Verified Junction Matches ({matchesList.length})
            </h3>
            <p className="text-xs text-secondary dark:text-slate-400">
              Active pairings recorded in PostgreSQL <code>item_matches</code> table
            </p>
          </div>
        </div>

        {matchesList.length === 0 ? (
          <div className="p-8 text-center text-xs text-secondary dark:text-slate-400">
            No matches confirmed yet. Select a candidate pair above to execute your first match.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low dark:bg-darkcanvas-border/50 text-secondary dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-6">Match ID</th>
                  <th className="py-3 px-6">Lost Docket</th>
                  <th className="py-3 px-6">Found Item</th>
                  <th className="py-3 px-6">Match Date</th>
                  <th className="py-3 px-6 text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container dark:divide-darkcanvas-border">
                {matchesList.map((m) => (
                  <tr key={m.match_id} className="hover:bg-surface-container-low/40 dark:hover:bg-darkcanvas-border/30 transition">
                    <td className="py-3.5 px-6 font-mono font-bold text-primary dark:text-white">
                      #{m.match_id}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-primary dark:text-white">
                        Request #{m.request_id}
                      </span>
                      <span className="block text-[11px] text-secondary dark:text-slate-400">
                        {m.lost_requests?.category} ({m.lost_requests?.colour || '—'})
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-primary dark:text-white">
                        Found #{m.found_id}
                      </span>
                      <span className="block text-[11px] text-secondary dark:text-slate-400">
                        Locker: {m.found_items?.location || 'Admin Office'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px] text-secondary dark:text-slate-400">
                      {m.match_date ? new Date(m.match_date).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Check size={12} />
                        <span>Verified Paired</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddFoundItemModal
        isOpen={showAddFoundModal}
        onClose={() => setShowAddFoundModal(false)}
        onItemAdded={() => loadMatchData()}
      />
    </div>
  );
};

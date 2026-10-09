import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCircle2, Clock, ShieldCheck, Mail, AlertCircle } from 'lucide-react';

export const StudentNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [requestUpdates, setRequestUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: notifs, error: notifErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', user.id)
        .order('sent_date', { ascending: false });

      if (notifErr) throw notifErr;

      const { data: requests, error: reqErr } = await supabase
        .from('lost_requests')
        .select(`
          request_id,
          category,
          status,
          date_report,
          reviewed_by,
          admins (name)
        `)
        .eq('student_id', user.id)
        .order('date_report', { ascending: false });

      if (reqErr) throw reqErr;

      setNotifications(notifs || []);
      setRequestUpdates(requests || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="pb-2 border-b border-surface-container dark:border-darkcanvas-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
          Official Telemetry Stream
        </span>
        <h1 className="font-display font-bold text-2xl text-primary dark:text-white tracking-tight mt-0.5">
          Notifications & Security Alerts
        </h1>
        <p className="text-xs text-secondary dark:text-slate-400">
          Official status feed triggered when your lost item matches a recovered article or an admin reviews your case.
        </p>
      </div>

      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-secondary text-xs">
            <div className="w-6 h-6 border-2 border-primary dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading notifications stream...
          </div>
        ) : notifications.length === 0 && requestUpdates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-container-low dark:bg-darkcanvas-border text-secondary flex items-center justify-center mx-auto mb-3">
              <Bell size={22} />
            </div>
            <h3 className="text-sm font-bold text-primary dark:text-white">No notifications yet</h3>
            <p className="text-xs text-secondary dark:text-slate-400 max-w-sm mx-auto mt-1">
              You will automatically receive an alert here when the admin updates your request status or marks a found item match.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-container dark:divide-darkcanvas-border">
            {/* 1. Official Matched Notifications */}
            {notifications.map((notif) => (
              <div
                key={`notif-${notif.notify_id}`}
                className="p-5 hover:bg-surface-container-low/50 dark:hover:bg-darkcanvas-border/30 transition flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5 border border-secondary dark:border-purple-800">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-primary dark:text-purple-300 uppercase tracking-wider">
                      Match Notification #{notif.notify_id}
                    </span>
                    <span className="text-[11px] text-secondary dark:text-slate-400 flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      {notif.sent_date ? new Date(notif.sent_date).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface dark:text-slate-200 leading-relaxed font-medium">
                    {notif.message}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Dispatched Status: {notif.email_status}
                    </span>
                    <span className="text-[11px] text-secondary dark:text-slate-400 font-mono">
                      Match Reference: #{notif.match_id}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* 2. Admin Review Lifecycle Updates */}
            {requestUpdates
              .filter((req) => req.status !== 'Pending')
              .map((req) => (
                <div
                  key={`req-update-${req.request_id}-${req.status}`}
                  className="p-5 hover:bg-surface-container-low/50 dark:hover:bg-darkcanvas-border/30 transition flex items-start gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                      req.status === 'Collected'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : req.status === 'Under Review'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        : req.status === 'Matched'
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                        : 'bg-surface-container text-secondary border-surface-container-high'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs uppercase tracking-wider text-primary dark:text-white">
                        Admin Status Update • Request #{req.request_id}
                      </span>
                      <span className="text-[11px] text-secondary dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock size={12} />
                        {req.date_report}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed">
                      Your lost report for <strong className="text-primary dark:text-white">{req.category}</strong> has been updated to{' '}
                      <strong className="text-primary dark:text-white">{req.status}</strong> by administrator{' '}
                      <span className="font-semibold text-primary dark:text-white">{req.admins?.name || 'Campus Proctor'}</span>.
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

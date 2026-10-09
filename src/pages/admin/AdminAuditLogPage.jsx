import React from 'react';
import { History, Info, Terminal, ShieldCheck } from 'lucide-react';

export const AdminAuditLogPage = () => {
  return (
    <div className="max-w-4xl space-y-6 font-sans">
      <div className="pb-2 border-b border-surface-container dark:border-darkcanvas-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
          Compliance & Traceability
        </span>
        <h1 className="font-display font-bold text-2xl text-primary dark:text-white tracking-tight mt-0.5">
          System Audit Log Telemetry
        </h1>
        <p className="text-xs text-secondary dark:text-slate-400">
          Database Extension Point & Architectural Placeholder
        </p>
      </div>

      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl border border-surface-container-high dark:border-darkcanvas-border p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container dark:bg-darkcanvas-border text-primary dark:text-white flex items-center justify-center shrink-0 border border-surface-container-high dark:border-darkcanvas-border">
            <History size={24} />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-primary dark:text-white">
              Strict Schema Compliance Notice
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-slate-300 mt-1 leading-relaxed">
              Per your project specifications, there is currently no separate <code className="bg-surface-container dark:bg-darkcanvas-border text-primary dark:text-white px-1.5 py-0.5 rounded font-mono text-[11px]">audit_log</code> table in the authorized 6-table relational PostgreSQL schema (which includes: <code className="font-mono">students</code>, <code className="font-mono">admins</code>, <code className="font-mono">lost_requests</code>, <code className="font-mono">found_items</code>, <code className="font-mono">item_matches</code>, <code className="font-mono">notifications</code>).
            </p>
            <p className="text-xs text-secondary dark:text-slate-400 mt-2 leading-relaxed">
              In accordance with your explicit instructions, no artificial or mock audit log data is generated. This screen serves as a clean architectural extension placeholder.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container dark:border-darkcanvas-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-white">
            <Terminal size={15} />
            <span>Proposed DDL Extension for Phase 2 (Optional)</span>
          </div>
          <pre className="p-3.5 rounded-lg bg-surface-container-lowest dark:bg-slate-950 border border-surface-container-high dark:border-darkcanvas-border text-[11px] font-mono text-primary dark:text-slate-300 overflow-x-auto leading-relaxed">
{`create table if not exists public.audit_logs (
  log_id      bigint generated always as identity primary key,
  admin_id    uuid references public.admins(admin_id),
  action      text not null,
  target_id   bigint,
  details     jsonb,
  created_at  timestamptz default now()
);`}
          </pre>
        </div>

        <div className="p-4 rounded-xl bg-secondary-container/40 dark:bg-blue-950/20 border border-secondary/30 dark:border-blue-900/40 flex items-start gap-3 text-xs text-primary dark:text-blue-300">
          <Info size={16} className="shrink-0 mt-0.5 text-secondary dark:text-blue-400" />
          <span>
            Current operational actions (such as status updates and atomic match creation via <code className="font-mono">create_match()</code>) record the executing administrator's ID directly in <code className="font-mono">lost_requests.reviewed_by</code> and <code className="font-mono">found_items.admin_id</code>.
          </span>
        </div>
      </div>
    </div>
  );
};

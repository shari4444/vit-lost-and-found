import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ShieldCheck, AlertCircle, ArrowLeft, KeyRound, Lock, UserCheck } from 'lucide-react';
import { VitBrand } from '../../components/VitBrand';

export const AdminLoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let loginEmail = usernameOrEmail.trim();

      if (!loginEmail.includes('@')) {
        loginEmail = `${loginEmail}@admin.vit.ac.in`;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (authError) throw authError;

      const { data: adminRecord, error: adminQueryError } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_id', authData.user.id)
        .maybeSingle();

      if (adminQueryError) throw adminQueryError;

      if (!adminRecord) {
        await supabase.auth.signOut();
        throw new Error(
          'Access Restricted: Student accounts cannot log in through the Administrative Console. Please sign in via the Student Portal.'
        );
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Administrative authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkcanvas-bg font-sans antialiased text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">

      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2">
            <VitBrand showSubtitle={false} className="h-12" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-darkcanvas-muted">
            Proctorial Board & Estate Security
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-primary dark:text-white tracking-tight mt-1">
            Administrative Registry Console
          </h1>
          <p className="text-xs text-on-surface-variant dark:text-slate-300 max-w-xs mt-1">
            Secured gateway for custodial verification, intake logging, and match approvals.
          </p>
        </div>

        <div className="bg-darkcanvas-surface rounded-xl shadow-lg border border-darkcanvas-border p-6 sm:p-8">
          <div className="flex items-center gap-2 p-3 bg-blue-950/70 border border-blue-800/60 text-white rounded-lg mb-6 shadow-sm">
            <ShieldCheck size={18} className="text-blue-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wide">
                Restricted Access
              </span>
              <span className="text-[11px] text-slate-300">
                PostgreSQL Role-Based Security Verified
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-900/50 flex items-start gap-2.5 text-xs text-red-300 leading-snug">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Admin Username / Email
              </label>
              <div className="relative flex items-center">
                <UserCheck size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="admin or admin@vit.ac.in"
                  className="w-full h-10 pl-9 pr-3 bg-darkcanvas-bg text-white rounded-lg text-xs placeholder:text-slate-500 border border-darkcanvas-border focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Security Password
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-3 bg-darkcanvas-bg text-white rounded-lg text-xs placeholder:text-slate-500 border border-darkcanvas-border focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <KeyRound size={15} />
                  <span>Authenticate Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-container-high dark:border-darkcanvas-border text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-white transition"
            >
              <ArrowLeft size={13} />
              <span>Back to Student Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

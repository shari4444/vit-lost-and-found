import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import {
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  School,
  Lock,
  Mail,
  User,
  Phone,
  Bookmark
} from 'lucide-react';
import { VitBrand } from '../../components/VitBrand';

export const StudentLoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    roll_no: '',
    department: 'Computer Engineering',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const departments = [
    'Computer Engineering',
    'Information Technology',
    'Electronics & Telecommunication',
    'Biomedical Engineering',
    'Electronics & Computer Science',
    'Data Science & AI',
    'Other Department'
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) throw error;

      // Strictly verify: Admins are not allowed to log in via Student Portal
      const { data: adminRecord } = await supabase
        .from('admins')
        .select('admin_id')
        .eq('admin_id', data.user.id)
        .maybeSingle();

      if (adminRecord) {
        await supabase.auth.signOut();
        setErrorMsg('Access Restricted: Administrative accounts cannot sign in through the Student Portal. Please use the Admin Portal.');
        setLoading(false);
        return;
      }

      // Sync student profile if missing
      const { data: studentRecord } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', data.user.id)
        .maybeSingle();

      if (!studentRecord && data.user?.user_metadata?.roll_no) {
        await supabase.from('students').upsert({
          student_id: data.user.id,
          roll_no: data.user.user_metadata.roll_no,
          name: data.user.user_metadata.name || data.user.email.split('@')[0],
          email: data.user.email,
          department: data.user.user_metadata.department || null,
          phone_number: data.user.user_metadata.phone_number || null,
        });
      }

      navigate('/student/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate. Please check your institutional email & password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (signupData.password !== signupData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (signupData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // Disallow administrative email addresses
      const { data: adminCheck } = await supabase
        .from('admins')
        .select('admin_id')
        .eq('email', signupData.email.trim())
        .maybeSingle();

      if (adminCheck) {
        setErrorMsg('Access Restricted: Administrative accounts cannot register via the Student Portal.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: signupData.email.trim(),
        password: signupData.password,
        options: {
          data: {
            name: signupData.name.trim(),
            roll_no: signupData.roll_no.trim(),
            department: signupData.department,
            phone_number: signupData.phone_number.trim(),
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        // Upsert into students table
        await supabase.from('students').upsert({
          student_id: data.user.id,
          name: signupData.name.trim(),
          roll_no: signupData.roll_no.trim(),
          email: signupData.email.trim(),
          department: signupData.department,
          phone_number: signupData.phone_number.trim() || null,
        });

        if (data.session) {
          navigate('/student/dashboard');
          return;
        }

        setSuccessMsg('Account registered successfully! You may now sign in.');
        setActiveTab('login');
        setLoginEmail(signupData.email);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register student profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkcanvas-bg font-sans antialiased text-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-md mx-auto">
        {/* University Crest & Identification */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2">
            <VitBrand showSubtitle={false} className="h-12" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Vidyalankar Institute of Technology
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight mt-1">
            Custodial Registry & Lost Property Portal
          </h1>
          <p className="text-xs text-slate-300 max-w-xs mt-1">
            Official institutional system for recovering lost belongings and logging claims across campus blocks.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-darkcanvas-surface rounded-xl shadow-lg border border-darkcanvas-border p-6 sm:p-8">
          {/* Segmented Authentication Switcher */}
          <div className="w-full bg-slate-900/80 border border-darkcanvas-border p-1 rounded-lg flex mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn size={15} />
              <span>Student Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus size={15} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 leading-snug">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 leading-snug">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1">
                  Student Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3 text-secondary dark:text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@vit.edu.in"
                    className="w-full h-10 pl-9 pr-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1">
                  Account Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3 text-secondary dark:text-slate-400 pointer-events-none" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full h-10 pl-9 pr-10 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 text-secondary hover:text-primary dark:text-slate-400 dark:hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
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
                    <span>Sign In to Student Portal</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full h-px bg-surface-container-high dark:bg-darkcanvas-border absolute"></div>
                <span className="relative bg-surface-container-lowest dark:bg-darkcanvas-surface px-3 text-[11px] text-secondary dark:text-slate-400">
                  New to the registry?
                </span>
              </div>

              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
                className="w-full h-10 bg-surface-container-low dark:bg-darkcanvas-border text-primary dark:text-white hover:bg-surface-container font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserPlus size={15} />
                <span>Register New Student Profile</span>
              </button>
            </form>
          ) : (
            /* TAB 2: SIGNUP */
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3 text-secondary dark:text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    placeholder="e.g. Rahul Verma"
                    className="w-full h-9 pl-9 pr-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1">
                    Student Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={15} className="absolute left-3 text-secondary dark:text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="name.roll@vit.edu.in"
                      className="w-full h-9 pl-9 pr-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1">
                    Roll Number / Reg ID
                  </label>
                  <div className="relative flex items-center">
                    <Bookmark size={15} className="absolute left-3 text-secondary dark:text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={signupData.roll_no}
                      onChange={(e) => setSignupData({ ...signupData, roll_no: e.target.value })}
                      placeholder="21BCE1048"
                      className="w-full h-9 pl-9 pr-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs uppercase placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1">
                    Department
                  </label>
                  <select
                    value={signupData.department}
                    onChange={(e) => setSignupData({ ...signupData, department: e.target.value })}
                    className="w-full h-9 px-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1">
                    Contact Phone
                  </label>
                  <div className="relative flex items-center">
                    <Phone size={15} className="absolute left-3 text-secondary dark:text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      value={signupData.phone_number}
                      onChange={(e) => setSignupData({ ...signupData, phone_number: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full h-9 pl-9 pr-3 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={15} className="absolute left-3 text-secondary dark:text-slate-400 pointer-events-none" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full h-9 pl-9 pr-8 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-2.5 text-secondary hover:text-primary dark:text-slate-400"
                    >
                      {showSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary dark:text-slate-200 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={15} className="absolute left-3 text-secondary dark:text-slate-400 pointer-events-none" />
                    <input
                      type={showSignupConfirm ? 'text' : 'password'}
                      required
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full h-9 pl-9 pr-8 bg-surface-container-low dark:bg-darkcanvas-bg text-on-surface dark:text-white rounded-lg text-xs placeholder:text-outline border border-surface-container-high dark:border-darkcanvas-border focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary-container transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                      className="absolute right-2.5 text-secondary hover:text-primary dark:text-slate-400"
                    >
                      {showSignupConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Create Student Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Administrative Security Switcher Footnote */}
          <div className="mt-6 pt-4 border-t border-surface-container-high dark:border-darkcanvas-border flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-1.5 text-[11px] text-secondary dark:text-darkcanvas-muted">
              <Shield size={13} />
              <span>Campus Security & Estate Custodial Division</span>
            </div>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary dark:text-white hover:text-secondary dark:hover:text-slate-300 py-1 px-3 rounded bg-surface-container-low dark:bg-darkcanvas-border transition-colors"
            >
              <span>Campus Security Administrative Login</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { ThemeToggle } from '../components/ThemeToggle';
import { VitBrand } from '../components/VitBrand';
import {
  LayoutDashboard,
  FilePlus,
  Inbox,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  FileText,
  GitMerge,
  Users,
  History
} from 'lucide-react';

export const StudentLayout = ({ children, title }) => {
  const { studentData, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const { data: notifs } = await supabase
          .from('notifications')
          .select('notify_id')
          .eq('student_id', user.id);

        const { data: activeReqs } = await supabase
          .from('lost_requests')
          .select('request_id')
          .eq('student_id', user.id)
          .eq('status', 'Matched');

        const count = (notifs?.length || 0) + (activeReqs?.length || 0);
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };
    fetchUnread();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const studentNavItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Report Lost Item', path: '/student/report', icon: FilePlus },
    { name: 'My Requests', path: '/student/requests', icon: Inbox },
    { name: 'Found Items', path: '/student/found-items', icon: Search },
    { name: 'Notifications', path: '/student/notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-darkcanvas-bg text-white flex flex-col md:flex-row transition-colors duration-150 font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-darkcanvas-surface border-b border-darkcanvas-border px-3.5 py-2.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-darkcanvas-border focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <VitBrand showSubtitle={false} />
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to="/student/report"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-sm"
          >
            <FilePlus size={13} />
            <span>Report</span>
          </NavLink>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Desktop & Mobile Overlay */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-darkcanvas-surface border-r border-darkcanvas-border z-40 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-darkcanvas-border flex items-center">
          <VitBrand />
        </div>

        {/* Portal Console Sub-badge */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-950/60 border border-blue-800/50 text-blue-200 rounded-lg shadow-sm">
            <ShieldCheck size={16} className="text-blue-400 shrink-0" />
            <span className="text-[11px] font-bold tracking-wider uppercase">
              STUDENT PORTAL
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Student Services
          </div>
          <nav className="space-y-1">
            {studentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footnote */}
        <div className="p-3 bg-darkcanvas-surface border-t border-darkcanvas-border flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {studentData?.name ? studentData.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {studentData?.name || 'Student'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {studentData?.roll_no || studentData?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-slate-300 hover:text-red-400 hover:bg-darkcanvas-border px-3 py-1.5 rounded-lg text-xs font-semibold transition-all w-full"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Desktop Only */}
        <header className="hidden md:flex h-16 bg-darkcanvas-surface/90 backdrop-blur-md border-b border-darkcanvas-border px-6 lg:px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded bg-darkcanvas-border text-white text-[11px] font-bold tracking-wider uppercase">
              Vidyalankar Campus Registry
            </span>
            <h2 className="text-sm font-bold text-white font-display">
              {title || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <NavLink
              to="/student/report"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-md transition"
            >
              <FilePlus size={15} />
              <span>Report Lost Item</span>
            </NavLink>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

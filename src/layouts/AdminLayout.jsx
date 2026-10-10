import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VitBrand } from '../components/VitBrand';
import {
  LayoutDashboard,
  FileText,
  GitMerge,
  Users,
  History,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

export const AdminLayout = ({ children, title, onOpenNewFoundModal }) => {
  const { adminData, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const adminNavItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Lost Requests', path: '/admin/lost-requests', icon: FileText },
    { name: 'Match Management', path: '/admin/match-management', icon: GitMerge },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Audit Log', path: '/admin/audit-log', icon: History },
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
          {onOpenNewFoundModal && (
            <button
              onClick={onOpenNewFoundModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-sm"
            >
              <PlusCircle size={13} />
              <span>Log</span>
            </button>
          )}
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

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-surface-container-low dark:bg-darkcanvas-surface border-r border-surface-container-high dark:border-darkcanvas-border z-40 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-surface-container-high dark:border-darkcanvas-border flex items-center">
          <VitBrand subtitle="Campus Admin Console" />
        </div>

        {/* Console Mode Badge */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-container dark:bg-primary text-on-primary-container rounded-lg shadow-sm">
            <ShieldCheck size={16} className="text-secondary-fixed shrink-0" />
            <span className="text-[11px] text-on-primary font-bold tracking-wider uppercase">
              ADMINISTRATIVE OPS
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Administrative Ops
          </div>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon
                    size={17}
                    className={isActive ? 'text-white' : 'text-slate-400'}
                  />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin Profile & Actions */}
        <div className="p-3 bg-darkcanvas-surface border-t border-darkcanvas-border flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {adminData?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {adminData?.email}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Admin Header - Desktop Only */}
        <header className="hidden md:flex h-16 bg-darkcanvas-surface/90 backdrop-blur-md border-b border-darkcanvas-border px-6 lg:px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded bg-darkcanvas-border text-white text-[11px] font-bold tracking-wider uppercase">
              Vidyalankar Campus Registry
            </span>
            <h2 className="text-sm font-bold text-white font-display">
              {title || 'Admin Ops'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {onOpenNewFoundModal && (
              <button
                onClick={onOpenNewFoundModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                <PlusCircle size={15} />
                <span>Log Found Item</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-3.5 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

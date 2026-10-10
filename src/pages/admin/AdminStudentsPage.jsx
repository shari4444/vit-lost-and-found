import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Users, Mail, Phone, Bookmark, Building } from 'lucide-react';

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.roll_no?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      (s.department && s.department.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-2 border-b border-surface-container dark:border-darkcanvas-border">
        <span className="text-[11px] font-bold uppercase tracking-wider text-secondary dark:text-slate-400">
          Student Identity Registry
        </span>
        <h1 className="font-display font-bold text-2xl text-primary dark:text-white tracking-tight mt-0.5">
          Registered Students Directory
        </h1>
        <p className="text-xs text-secondary dark:text-slate-400">
          PostgreSQL Table: <code>students</code>. Note: Credentials and passwords remain strictly isolated in Supabase Auth and are never exposed.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface p-4 rounded-xl border border-surface-container-high dark:border-darkcanvas-border flex items-center gap-3 shadow-sm">
        <Search size={16} className="text-secondary dark:text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter students by name, roll number, email, or department..."
          className="w-full bg-surface-container-low dark:bg-darkcanvas-bg border border-surface-container-high dark:border-darkcanvas-border rounded-lg px-3 py-2 text-xs text-on-surface dark:text-white placeholder:text-outline focus:outline-none"
        />
      </div>

      {/* Students Table */}
      <div className="bg-surface-container-lowest dark:bg-darkcanvas-surface rounded-xl border border-surface-container-high dark:border-darkcanvas-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-secondary text-xs">
            <div className="w-6 h-6 border-2 border-primary dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading student records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-secondary text-xs">
            No student records found matching "{searchTerm}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low dark:bg-darkcanvas-border/50 text-secondary dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-surface-container dark:border-darkcanvas-border">
                  <th className="py-3.5 px-3.5 sm:px-5 whitespace-nowrap">Student Name</th>
                  <th className="py-3.5 px-3.5 sm:px-5 whitespace-nowrap">Roll Number</th>
                  <th className="py-3.5 px-3.5 sm:px-5 whitespace-nowrap">Department</th>
                  <th className="py-3.5 px-3.5 sm:px-5 whitespace-nowrap">Email Address</th>
                  <th className="py-3.5 px-3.5 sm:px-5 whitespace-nowrap">Contact Phone</th>
                  <th className="py-3.5 px-3.5 sm:px-5 whitespace-nowrap">System UUID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container dark:divide-darkcanvas-border">
                {filtered.map((student) => (
                  <tr key={student.student_id} className="hover:bg-surface-container-low/40 dark:hover:bg-darkcanvas-border/30 transition">
                    <td className="py-3.5 px-3.5 sm:px-5 whitespace-nowrap">
                      <div className="font-bold text-primary dark:text-white text-xs">{student.name}</div>
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-5 font-mono font-bold text-primary dark:text-white whitespace-nowrap">
                      {student.roll_no}
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-5 text-secondary dark:text-slate-300 whitespace-nowrap">
                      {student.department || 'Not specified'}
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-5 text-on-surface dark:text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      {student.email}
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-5 text-secondary dark:text-slate-400 whitespace-nowrap">
                      {student.phone_number || '—'}
                    </td>
                    <td className="py-3.5 px-3.5 sm:px-5 font-mono text-[10px] text-secondary dark:text-slate-500 whitespace-nowrap">
                      {student.student_id ? `${student.student_id.slice(0, 8)}...` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

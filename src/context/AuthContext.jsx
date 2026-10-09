import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({
  user: null,
  role: null, // 'student' | 'admin' | null
  studentData: null,
  adminData: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoleData = async (authUser) => {
    if (!authUser) {
      setRole(null);
      setStudentData(null);
      setAdminData(null);
      return;
    }

    try {
      // 1. Check if user is an admin in admins table
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_id', authUser.id)
        .maybeSingle();

      if (!adminErr && adminRecord) {
        setRole('admin');
        setAdminData(adminRecord);
        setStudentData(null);
        return;
      }

      // 2. Otherwise check if user is in students table
      const { data: studentRecord, error: studentErr } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', authUser.id)
        .maybeSingle();

      if (!studentErr && studentRecord) {
        setRole('student');
        setStudentData(studentRecord);
        setAdminData(null);
        return;
      }

      // If user is authenticated and not in admins, assign student role
      const studentMeta = authUser.user_metadata || {};
      setRole('student');
      setStudentData({
        student_id: authUser.id,
        roll_no: studentMeta.roll_no || 'STUDENT',
        name: studentMeta.name || authUser.email.split('@')[0],
        email: authUser.email,
        department: studentMeta.department || 'VIT Student',
        phone_number: studentMeta.phone_number || '',
      });
    } catch (err) {
      console.error('Error fetching role data:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchRoleData(currentUser).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchRoleData(currentUser);
      } else {
        setRole(null);
        setStudentData(null);
        setAdminData(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchRoleData(user);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setStudentData(null);
    setAdminData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        studentData,
        adminData,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

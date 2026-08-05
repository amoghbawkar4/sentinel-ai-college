import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const SESSION_KEY = 'sentinelai_admin_session';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminEmail: string;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');

  const login = (email: string, password: string) => {
    const valid = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    if (valid) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAdminAuthenticated(true);
    }
    return valid;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAdminAuthenticated(false);
  };

  const value = useMemo(() => ({ isAdminAuthenticated, adminEmail: ADMIN_EMAIL, login, logout }), [isAdminAuthenticated]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
}

import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const cachedUser = localStorage.getItem("cp_user");
      const token = localStorage.getItem("cp_token");

      if (!token) {
        setLoading(false);
        return;
      }

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          // ignore corrupt cache
        }
      }

      try {
        const { user: freshUser } = await authService.getMe();
        setUser(freshUser);
        localStorage.setItem("cp_user", JSON.stringify(freshUser));
      } catch {
        localStorage.removeItem("cp_token");
        localStorage.removeItem("cp_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const persistSession = ({ token, user: nextUser }) => {
    localStorage.setItem("cp_token", token);
    localStorage.setItem("cp_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    persistSession(data);
    return data;
  };

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    persistSession(data);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("cp_token");
      localStorage.removeItem("cp_user");
      setUser(null);
    }
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("cp_user", JSON.stringify(nextUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    // "superadmin" (the developer/owner account) has every admin
    // privilege plus more, so it counts as admin here too.
    isAdmin: user?.role === "admin" || user?.role === "superadmin",
    isSuperAdmin: user?.role === "superadmin",
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;

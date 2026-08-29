import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nextstep-bflm.onrender.com";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/me`, {
        withCredentials: true,
      });

      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (emailId, password) => {
    const res = await axios.post(
      `${API_BASE_URL}/api/login`,
      { emailId, password },
      { withCredentials: true },
    );

    if (res.data.success) {
      setUser(res.data.user);
    }

    return res.data;
  };

  const logout = async () => {
    await axios.post(
      `${API_BASE_URL}/api/logout`,
      {},
      { withCredentials: true },
    );

    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

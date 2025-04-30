
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "manager" | "agent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isManager: boolean;
  isAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// This is a mock implementation for demonstration purposes
// In a real app, this would connect to your backend
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem("bpo_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // In a real app, this would call your backend authentication API
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      // Mock authentication logic
      // This simulates a login API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Debug users for testing
      if (email === "manager@example.com" && password === "manager") {
        const user: User = {
          id: "m1",
          name: "Manager User",
          email: "manager@example.com",
          role: "manager"
        };
        setUser(user);
        localStorage.setItem("bpo_user", JSON.stringify(user));
        console.log("Manager login successful:", user);
      } else if (email === "agent@example.com" && password === "agent") {
        // IMPORTANT: Fix - This should be "a1" to match the task assignments in DataService
        const user: User = {
          id: "a1", // Ensuring this matches the assignedTo field in tasks
          name: "John Smith", // Using the actual name that matches the agent in DataService
          email: "agent@example.com",
          role: "agent"
        };
        setUser(user);
        localStorage.setItem("bpo_user", JSON.stringify(user));
        console.log("Agent login successful:", user);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("bpo_user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isManager: user?.role === "manager",
    isAgent: user?.role === "agent"
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

"use client"; // Context uses hooks so it must be a client component

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// --- TYPES ---
// Define the shape of a logged in user
interface User {
  id: number;
  name: string;
  email: string;
}

// Define everything the auth context exposes to the rest of the app
interface AuthContextType {
  user: User | null;           // The logged in user, or null if not logged in
  token: string | null;        // The JWT token used to make authenticated API calls
  login: (token: string, user: User) => void;  // Call this after a successful login/signup
  logout: () => void;          // Call this to log the user out
  isLoading: boolean;          // True while we're checking if the user is already logged in
}

// --- CREATE CONTEXT ---
// createContext creates a "global store" any component can read from.
// We pass null as the default — components must be wrapped in AuthProvider to use it.
const AuthContext = createContext<AuthContextType | null>(null);

// --- AUTH PROVIDER ---
// This component wraps the whole app (in layout.tsx) and provides auth state
// to every component inside it via React Context.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);       // Logged in user
  const [token, setToken] = useState<string | null>(null);   // JWT token
  const [isLoading, setIsLoading] = useState(true);          // Loading while checking storage

  // --- REHYDRATE SESSION ON PAGE LOAD ---
  // When the app loads, check if the user was already logged in from a previous session.
  // We store the token and user in localStorage so they persist across page refreshes.
  useEffect(() => {
    const storedToken = localStorage.getItem("fittrack_token");
    const storedUser = localStorage.getItem("fittrack_user");

    if (storedToken && storedUser) {
      // Restore the session from localStorage
      setToken(storedToken);
      setUser(JSON.parse(storedUser)); // Parse the JSON string back into an object
    }

    setIsLoading(false); // Done checking — hide any loading states
  }, []); // Empty array = only runs once when the component first mounts

  // --- LOGIN ---
  // Called after a successful signup or login API response.
  // Saves the token and user to state AND localStorage for persistence.
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("fittrack_token", newToken);
    localStorage.setItem("fittrack_user", JSON.stringify(newUser)); // Must stringify objects
  };

  // --- LOGOUT ---
  // Clears everything from state and localStorage.
  // After this, the user will be treated as unauthenticated.
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("fittrack_token");
    localStorage.removeItem("fittrack_user");
  };

  return (
    // Provide the auth values to all child components
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- useAuth HOOK ---
// A custom hook that makes it easy to access auth context in any component.
// Instead of writing useContext(AuthContext) every time, components just call useAuth().
// Example usage in a component:
//   const { user, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);

  // If useAuth() is called outside of AuthProvider, context will be null.
  // This error helps catch that mistake during development.
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}

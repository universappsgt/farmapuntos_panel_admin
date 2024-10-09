import React, { createContext, useContext, ReactNode } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { User } from "firebase/auth";
import { auth } from "firebase";

interface AuthContextType {
  user: User | null | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useAuthState(auth);
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

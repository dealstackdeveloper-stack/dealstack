"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => boolean;
  logout: () => void;
};

const AuthContext =
  createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {

    const auth =
      localStorage.getItem("dealstack-auth");

    if (auth === "true") {
      setIsAuthenticated(true);
    }

  }, []);

  function login(
    email: string,
    password: string
  ) {

    if (
      email === "admin@dealstack.com" &&
      password === "admin123"
    ) {

      localStorage.setItem(
        "dealstack-auth",
        "true"
      );

      setIsAuthenticated(true);

      return true;
    }

    return false;
  }

  function logout() {

    localStorage.removeItem("dealstack-auth");

    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
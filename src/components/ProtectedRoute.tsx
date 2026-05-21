"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  const { isAuthenticated } = useAuth();

  useEffect(() => {

    if (!isAuthenticated) {

      router.push("/login");
    }

  }, [isAuthenticated, router]);

  if (!isAuthenticated) {

    return null;
  }

  return <>{children}</>;
}
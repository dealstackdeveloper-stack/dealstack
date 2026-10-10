"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      setChecking(true);

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          if (active) {
            setAuthorized(false);
            router.replace("/login");
          }
          return;
        }

        const response = await fetch("/api/admin/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!active) return;

        if (!response.ok || result.authorized !== true) {
          setAuthorized(false);
          await supabase.auth.signOut();
          router.replace("/");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error("Admin verification failed:", error);

        if (active) {
          setAuthorized(false);
          router.replace("/");
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    verifyAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setAuthorized(false);
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking || !authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Verifying administrator access...
      </div>
    );
  }

  return <>{children}</>;
}

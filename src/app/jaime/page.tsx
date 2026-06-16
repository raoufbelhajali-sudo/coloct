"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import InteressesListe from "@/components/InteressesListe";
import { useAuth } from "@/lib/auth";

export default function JaimePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/connexion");
  }, [loading, user, router]);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 pb-28 pt-5">
      <AppHeader />
      <InteressesListe />
    </main>
  );
}

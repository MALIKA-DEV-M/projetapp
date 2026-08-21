"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) setCurrentPlan(profile.plan);
      }
    }
    fetchPlan();
  }, []);

  const selectPlan = async (plan: "free" | "pro") => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (plan === "pro") {
      // 🚀 APPEL DE LA ROUTE STRIPE
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
          }),
        });

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url; // Redirection vers Stripe Checkout
        } else {
          alert("Erreur Stripe: " + (data.error || "Impossible de démarrer la session"));
        }
      } catch (err) {
        alert("Une erreur s'est produite lors de la redirection.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Gestion du forfait Gratuit
    const { error } = await supabase
      .from("profiles")
      .update({ plan })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      alert("Erreur lors du changement de forfait : " + error.message);
    } else {
      setCurrentPlan(plan);
      alert(`🎉 Forfait GRATUIT activé !`);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Choisissez votre forfait</h1>
      <p className="text-gray-600 mb-8">Sélectionnez la formule adaptée à vos besoins.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Offre Gratuit */}
        <div className="bg-white p-8 rounded-xl shadow-md border flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Gratuit</h2>
            <div className="my-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900">0 €</span>
              <span className="text-sm font-normal text-gray-500">/ mois</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>✓ 1 seule page autorisée</li>
              <li>✓ Composants de base</li>
              <li>✗ Pages multiples désactivées</li>
            </ul>
          </div>
          <button
            onClick={() => selectPlan("free")}
            disabled={currentPlan === "free" || loading}
            className="w-full py-3 bg-gray-200 text-gray-700 font-bold rounded disabled:opacity-50 hover:bg-gray-300 transition"
          >
            {currentPlan === "free" ? "Plan Actuel" : "Passer au Gratuit"}
          </button>
        </div>

        {/* Offre PRO */}
        <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-indigo-600 flex flex-col justify-between relative">
          <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
            Recommandé
          </span>
          <div>
            <h2 className="text-xl font-bold text-indigo-600">PRO</h2>
            <div className="my-4 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900">7.99 €</span>
              <span className="text-sm font-normal text-indigo-600">/ mois</span>
            </div>
            <ul className="text-sm text-green-600 space-y-2 mb-6">
              <li>✓ Pages illimitées (Multi-pages)</li>
              <li>✓ Accès à tous les composants</li>
              <li>✓ Support prioritaire</li>
            </ul>
          </div>
          <button
            onClick={() => selectPlan("pro")}
            disabled={currentPlan === "pro" || loading}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Chargement..." : currentPlan === "pro" ? "Plan Actuel" : "Activer l'offre PRO"}
          </button>
        </div>
      </div>
    </div>
  );
}
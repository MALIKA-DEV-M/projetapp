"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Plus, Globe, Edit3, Trash2, ExternalLink, Layout, Crown, Save } from "lucide-react";

type Site = {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  created_at: string;
  content: any;
};

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [domainInputs, setDomainInputs] = useState<{ [key: string]: string }>({});
  const [savingDomain, setSavingDomain] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserDataAndSites();
  }, []);

  const fetchUserDataAndSites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Récupération du plan de l'utilisateur
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profile?.plan) {
      setUserPlan(profile.plan);
    }

    // Récupération des sites de l'utilisateur
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSites(data);
      // Initialisation des champs de saisie de domaine
      const initialInputs: { [key: string]: string } = {};
      data.forEach((site) => {
        initialInputs[site.id] = site.custom_domain || "";
      });
      setDomainInputs(initialInputs);
    }
    setLoading(false);
  };

  const createNewSite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Génération d'un sous-domaine unique basique
    const generatedSubdomain = `site-${Date.now().toString().slice(-6)}`;

    const newSite = {
      name: "Mon Nouveau Site",
      user_id: user.id,
      subdomain: generatedSubdomain,
      published: true,
      content: {
        pages: [
          {
            id: "page-1",
            title: "Accueil",
            backgroundColor: "#ffffff",
            elements: [],
          },
        ],
      },
    };

    const { data, error } = await supabase.from("sites").insert([newSite]).select().single();

    if (error) {
      alert("Erreur lors de la création : " + error.message);
    } else if (data) {
      router.push(`/editor?id=${data.id}`);
    }
  };

  const saveCustomDomain = async (siteId: string) => {
    if (userPlan !== "pro") return;

    setSavingDomain(siteId);
    const domainValue = domainInputs[siteId]?.toLowerCase().trim() || null;

    const { error } = await supabase
      .from("sites")
      .update({ custom_domain: domainValue })
      .eq("id", siteId);

    if (error) {
      alert("Erreur lors de l'enregistrement du domaine : " + error.message);
    } else {
      alert("Nom de domaine mis à jour !");
      setSites(sites.map((s) => (s.id === siteId ? { ...s, custom_domain: domainValue } : s)));
    }
    setSavingDomain(null);
  };

  const deleteSite = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;

    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (!error) {
      setSites(sites.filter((site) => site.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse">Chargement de vos projets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layout className="text-indigo-500" /> Mes Projets
            </h1>
            <p className="text-xs text-slate-400 mt-1">Gérez vos sites et leurs noms de domaine</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Badge de statut du compte */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              userPlan === "pro" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-slate-800 text-slate-300"
            }`}>
              {userPlan === "pro" && <Crown className="w-3.5 h-3.5" />}
              Plan {userPlan.toUpperCase()}
            </span>

            <button
              onClick={createNewSite}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" /> Nouveau Projet
            </button>
          </div>
        </div>

        {/* Grille des sites */}
        {sites.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
            <Globe className="w-12 h-12 text-slate-600" />
            <p className="text-slate-400 text-sm">Vous n'avez pas encore de projet créé.</p>
            <button
              onClick={createNewSite}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
            >
              Créer mon premier site
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => {
              const siteUrl = site.custom_domain 
                ? `http://${site.custom_domain}` 
                : `http://${site.subdomain}.localhost:3000`;

              return (
                <div
                  key={site.id}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 transition group"
                >
                  <div>
                    <h3 className="font-bold text-slate-200 text-base group-hover:text-indigo-400 transition">
                      {site.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Créé le {new Date(site.created_at).toLocaleDateString()}
                    </p>

                    {/* Section Adresses du site */}
                    <div className="mt-4 space-y-2 text-xs">
                      {/* Sous-domaine Gratuit */}
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Adresse gratuite :</span>
                        <span className="text-indigo-400 font-mono text-[11px] truncate block">
                          https://{site.subdomain}.localhost:3000
                        </span>
                      </div>

                      {/* Domaine Personnalisé PRO */}
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Domaine .com (PRO) :</span>
                        {userPlan === "pro" ? (
                          <div className="flex gap-1.5 mt-1">
                            <input
                              type="text"
                              placeholder="ex: monsite.com"
                              value={domainInputs[site.id] || ""}
                              onChange={(e) =>
                                setDomainInputs({ ...domainInputs, [site.id]: e.target.value })
                              }
                              className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-[11px] flex-1 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => saveCustomDomain(site.id)}
                              disabled={savingDomain === site.id}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded transition disabled:opacity-50"
                              title="Enregistrer le domaine"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-[11px] text-amber-500/80 mt-0.5">
                            🔒 Passez au plan PRO pour activer un domaine .com
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => router.push(`/editor?id=${site.id}`)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Éditer
                    </button>
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition"
                      title="Voir le site public"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => deleteSite(site.id)}
                      className="p-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
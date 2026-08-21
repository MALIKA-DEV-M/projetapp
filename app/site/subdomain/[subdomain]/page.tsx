import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function SubdomainPage({ params }: { params: { subdomain: string } }) {
  // Recherche du site via le sous-domaine
  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("subdomain", params.subdomain)
    .eq("published", true)
    .maybeSingle();

  if (!site) notFound();

  return (
    <main className="min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold">Site Gratuit : {site.subdomain}</h1>
      {/* Contenu dynamique du site */}
    </main>
  );
}
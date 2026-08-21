import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function CustomDomainPage({ params }: { params: { domain: string } }) {
  // Recherche du site et vérification que le propriétaire est bien PRO
  const { data: site } = await supabase
    .from("sites")
    .select("*, profiles!inner(plan)")
    .eq("custom_domain", params.domain)
    .eq("published", true)
    .maybeSingle();

  // Si le site n'existe pas ou si le client n'a plus le plan 'pro', on bloque
  if (!site || site.profiles?.plan !== "pro") {
    notFound();
  }

  return (
    <main className="min-h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold">Site PRO : {site.custom_domain}</h1>
      {/* Contenu dynamique du site */}
    </main>
  );
}
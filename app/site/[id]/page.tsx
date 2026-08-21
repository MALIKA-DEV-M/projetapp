import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: site, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !site) {
    notFound();
  }

  const { content } = site;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{
        backgroundColor: content.bgColor,
        color: content.textColor,
      }}
    >
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold mb-6">{content.title}</h1>
        <p className="text-xl mb-8">{content.subtitle}</p>
        <button className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 transition">
          {content.buttonText}
        </button>
      </div>
    </div>
  );
}
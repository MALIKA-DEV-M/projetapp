import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0b0f17] text-white flex flex-col justify-center items-start px-8 md:px-20 overflow-hidden font-sans">
      {/* Fond avec grille */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-3xl space-y-6">
        {/* Badge Amber */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-mono">
          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          • Aucune ligne de code requise
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Votre site, construit{" "}
          <span className="text-amber-400">sous vos yeux.</span>
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl">
          Assemblez un site professionnel en quelques minutes grâce à des blocs
          prêts à l'emploi. Commencez gratuitement, passez en Pro dès que vous
          voulez aller plus loin.
        </p>

        {/* Boutons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl transition shadow-lg shadow-amber-500/10"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold rounded-xl transition"
          >
            Voir les tarifs
          </Link>
        </div>

        {/* Liste sous les boutons */}
        <div className="flex flex-wrap items-center gap-6 pt-4 text-xs md:text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Gratuit, sans carte bancaire
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Hébergement inclus
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Pro à 6,99 €/mois
          </span>
        </div>
      </div>
    </div>
  );
}
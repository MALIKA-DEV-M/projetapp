import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
          MySaaS
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition"
          >
            Se connecter
          </Link>
          <Link
            href="/editor"
            className="text-sm font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
          >
            Ouvrir l'éditeur
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center my-16 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300">
          ✨ Bienvenue sur votre plateforme
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Créez et publiez vos projets web{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            en quelques secondes
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl">
          Concevez vos pages sans écrire une seule ligne de code, gérez votre
          contenu en toute simplicité et déployez en un clic.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
          <Link
            href="/editor"
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition text-center"
          >
            Lancer l'éditeur
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl transition text-center"
          >
            Accéder à mon compte
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MySaaS. Tous droits réservés.
      </footer>
    </div>
  );
}
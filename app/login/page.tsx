"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Compte créé ! Vérifie tes e-mails ou connecte-toi.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleAuth} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md gap-4 flex flex-col">
        <h1 className="text-2xl font-bold text-center">{isSignUp ? "Créer un compte" : "Connexion"}</h1>
        
        <input
          type="email"
          placeholder="E-mail"
          className="p-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
          {isSignUp ? "S'inscrire" : "Se connecter"}
        </button>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-gray-600 hover:underline text-center"
        >
          {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
        </button>

        {message && <p className="text-center text-sm font-medium mt-2">{message}</p>}
      </form>
    </div>
  );
}
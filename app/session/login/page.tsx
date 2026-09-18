"use client";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/finance/dashboard",
      },
    });
  };

  return (
    <main>
      <h1>Login</h1>
      <button onClick={signInWithGoogle}>Login with Google</button>
    </main>
  );
}

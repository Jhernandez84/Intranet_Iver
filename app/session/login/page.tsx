"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const supabase = createClientComponentClient();

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

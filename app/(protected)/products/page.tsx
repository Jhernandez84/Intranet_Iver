// app/dashboard/page.tsx
import { createClient } from "../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  return (
    <div>
      <h1>Products</h1>
    </div>
  );
}

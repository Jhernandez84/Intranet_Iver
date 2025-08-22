// app/(dashboard)/layout.tsx

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-full min-h-0">
      {/* Panel izquierdo: su propio scroll (si la lista crece) */}

      {/* Panel derecho: scroll principal de la zona protegida */}
      <main className="min-h-0 overflow-auto">{children}</main>
    </div>
  );
}

// app/(dashboard)/layout.tsx

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100vh-70px)] justify-center p-2 md:flex">
      {/* Panel derecho: scroll principal de la zona protegida */}
      {children}
    </div>
  );
}

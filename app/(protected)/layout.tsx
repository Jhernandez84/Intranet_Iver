// app/(dashboard)/layout.tsx

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex-1 bg-gray-700">{children}</div>
    </>
  );
}

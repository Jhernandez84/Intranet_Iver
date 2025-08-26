export default function UnauthorizedPage() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600">Acceso denegado</h1>
      <p className="mt-4 text-gray-700">
        No tienes permiso para acceder a esta sección.
      </p>
    </div>
  );
}

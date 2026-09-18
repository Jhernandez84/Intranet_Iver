"use client";
import { useParams, useSearchParams } from "next/navigation";

export default function LiveFormClient() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();

  const id = params.id; // "324234-3426735-368492"
  // const program = search.get("program"); // "IverCapacita"

  // Aquí podrías hacer fetch en el cliente si lo prefieres.
  return (
    <div>
      <h1>Form ID: {id}</h1>
    </div>
  );
}

import { NextResponse } from "next/server";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Definimos la interfaz basada en la respuesta que esperas de la API de Tuu
interface TuuApiTransaction {
  id: string | number;
  created_at: string;
  amount: number;
  net_amount: number;
  fee: number;
  terminal_id: string;
  payment_method: string;
}

interface TuuApiResponse {
  data: TuuApiTransaction[];
}

export async function GET() {
  const supabase = createClientComponentClient();
  // Nota: Asegúrate de que esta URL sea la correcta según tu documentación de Haulmer/Tuu
  const TUU_API_URL = "https://api.tuu.cl/v1/export/transactions";

  try {
    // 1. Consultar API de Tuu
    const response = await fetch(TUU_API_URL, {
      headers: { Authorization: `Bearer ${process.env.TUU_TOKEN}` },
    });

    if (!response.ok) {
      throw new Error(`Error en la API de Tuu: ${response.statusText}`);
    }

    const jsonResponse = (await response.json()) as TuuApiResponse;
    const tuuTransactions = jsonResponse.data || [];

    // 2. Mapear al formato de nuestra DB (Type-safe)
    const formattedData = tuuTransactions.map((tx) => {
      const fullDate = new Date(tx.created_at);

      // Validación simple de fecha para evitar errores de .toISOString()
      const isValidDate = !isNaN(fullDate.getTime());
      const dateIso = isValidDate
        ? fullDate.toISOString()
        : new Date().toISOString();

      return {
        company_id: "tu-uuid-empresa", // TODO: Obtener dinámicamente según tu lógica multitenant
        provider_name: "TUU",
        external_tx_id: String(tx.id),
        gross_amount: Number(tx.amount),
        net_amount: Number(tx.net_amount),
        fee_amount: Number(tx.fee),
        transaction_day: dateIso.split("T")[0],
        transaction_time: dateIso.split("T")[1].split(".")[0],
        status: "PENDING",
        metadata: {
          terminal: tx.terminal_id,
          type: tx.payment_method,
        },
      };
    });

    if (formattedData.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "No data to sync",
      });
    }

    // 3. Insertar usando upsert para evitar duplicar por external_tx_id
    const { error } = await supabase
      .from("bank_payment_gateway_details")
      .upsert(formattedData, { onConflict: "external_tx_id" });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: formattedData.length,
    });
  } catch (err) {
    // Manejo de error seguro sin 'any'
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

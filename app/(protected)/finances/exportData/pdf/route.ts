import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FinanzasWithSedeRow = {
  sede_nombre: string | null;
  tipo_mov: string | null;
  fecha: string | null;
  num_doc: string | null;
  monto: number | null;
  sede_id?: string | null;
  company_id?: string | null;
};

type ReportRow = {
  sede: string;
  tipo: string;
  fecha: string;
  num_doc: string;
  monto: number;
};

function moneyCLP(n: number) {
  return n.toLocaleString("es-CL");
}

function safeStr(v: unknown, fallback = "—") {
  const s = (v ?? "").toString().trim();
  return s.length ? s : fallback;
}

function asNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const company_id = searchParams.get("company_id")?.trim() ?? "";
    if (!company_id) {
      return NextResponse.json(
        { error: "company_id requerido" },
        { status: 400 },
      );
    }

    const sede_id = searchParams.get("sede_id")?.trim() || null;
    const from = searchParams.get("from")?.trim() || null;
    const to = searchParams.get("to")?.trim() || null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Faltan variables SUPABASE (URL o SERVICE_ROLE_KEY)" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Ajusta nombres si tu view usa otros campos
    let q = supabase
      .from("finanzas_with_sede")
      .select("sede_nombre,tipo_mov,fecha,num_doc,monto,sede_id,company_id")
      .eq("company_id", company_id)
      .order("sede_nombre", { ascending: true })
      .order("fecha", { ascending: true });

    if (sede_id) q = q.eq("sede_id", sede_id);
    if (from) q = q.gte("fecha", from);
    if (to) q = q.lte("fecha", to);

    const { data, error } = await q;
    if (error) throw error;

    const rows: ReportRow[] = (data ?? []).map((r: FinanzasWithSedeRow) => ({
      sede: safeStr(r.sede_nombre ?? r.sede_id ?? "Sin sede", "Sin sede"),
      tipo: safeStr(r.tipo_mov, "—"),
      fecha: safeStr(r.fecha, "—"),
      num_doc: safeStr(r.num_doc, "—"),
      monto: asNumber(r.monto),
    }));

    // Agrupar por sede
    const grouped = new Map<string, ReportRow[]>();
    for (const r of rows) {
      if (!grouped.has(r.sede)) grouped.set(r.sede, []);
      grouped.get(r.sede)!.push(r);
    }

    // PDF
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) =>
      doc.on("end", () => resolve(Buffer.concat(chunks))),
    );

    const pageLeft = 40;
    const pageRight = 555;
    const col = {
      tipo: pageLeft,
      fecha: pageLeft + 140,
      docn: pageLeft + 240,
      monto: pageLeft + 420,
    };

    const addPageHeader = () => {
      doc
        .fontSize(15)
        .fillColor("#000")
        .text("Reporte de Movimientos por Sede", pageLeft, 30);
      doc
        .fontSize(9)
        .fillColor("#333")
        .text(`Empresa: ${company_id}`, pageLeft, 52);

      const periodText =
        from || to ? `Período: ${from ?? "—"} a ${to ?? "—"}` : "Período: —";
      doc.text(periodText, pageLeft, 64);
      if (sede_id) doc.text(`Filtro Sede ID: ${sede_id}`, pageLeft, 76);

      doc
        .strokeColor("#bbb")
        .moveTo(pageLeft, 92)
        .lineTo(pageRight, 92)
        .stroke();
      doc.y = 105;
    };

    const ensureSpace = (minRemaining: number) => {
      if (doc.y + minRemaining > 790) {
        doc.addPage();
        addPageHeader();
      }
    };

    addPageHeader();

    let grandTotal = 0;

    // ✅ sin IterableIterator error
    for (const [sede, sedeRows] of Array.from(grouped.entries())) {
      ensureSpace(90);

      doc.fontSize(12).fillColor("#000").text(`Sede: ${sede}`, pageLeft, doc.y);
      doc.moveDown(0.4);

      const yHeader = doc.y;
      doc.fontSize(10).fillColor("#000");
      doc.text("Ingreso/Egreso", col.tipo, yHeader, { width: 130 });
      doc.text("Fecha", col.fecha, yHeader, { width: 80 });
      doc.text("Nº Documento", col.docn, yHeader, { width: 170 });
      doc.text("Monto", col.monto, yHeader, {
        width: pageRight - col.monto,
        align: "right",
      });

      doc.moveDown(0.3);
      doc
        .strokeColor("#ddd")
        .moveTo(pageLeft, doc.y)
        .lineTo(pageRight, doc.y)
        .stroke();
      doc.moveDown(0.4);

      doc.fontSize(9).fillColor("#111");
      let sedeTotal = 0;

      for (const r of sedeRows) {
        ensureSpace(22);

        const y = doc.y;
        doc.text(r.tipo, col.tipo, y, { width: 130 });
        doc.text(r.fecha, col.fecha, y, { width: 80 });
        doc.text(r.num_doc, col.docn, y, { width: 170 });
        doc.text(moneyCLP(r.monto), col.monto, y, {
          width: pageRight - col.monto,
          align: "right",
        });

        sedeTotal += r.monto;
        doc.moveDown(0.35);
      }

      ensureSpace(35);
      doc.moveDown(0.2);
      doc
        .strokeColor("#ddd")
        .moveTo(pageLeft, doc.y)
        .lineTo(pageRight, doc.y)
        .stroke();
      doc.moveDown(0.4);

      doc.fontSize(10).fillColor("#000");
      doc.text("Total suma de los movimientos", col.docn, doc.y, {
        width: 170,
      });
      doc.text(moneyCLP(sedeTotal), col.monto, doc.y, {
        width: pageRight - col.monto,
        align: "right",
      });

      grandTotal += sedeTotal;
      doc.moveDown(1.2);
    }

    ensureSpace(40);
    doc
      .strokeColor("#bbb")
      .moveTo(pageLeft, doc.y)
      .lineTo(pageRight, doc.y)
      .stroke();
    doc.moveDown(0.6);

    doc.fontSize(11).fillColor("#000");
    doc.text("TOTAL GENERAL", col.docn, doc.y, { width: 170 });
    doc.text(moneyCLP(grandTotal), col.monto, doc.y, {
      width: pageRight - col.monto,
      align: "right",
    });

    doc.end();

    const pdfBuffer = await done;
    const filename = `reporte-finanzas_${company_id}_${from ?? "inicio"}_${to ?? "fin"}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error generando PDF";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

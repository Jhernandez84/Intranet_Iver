export default function text() {
  return;
}

// // ==============================================
// // Kitchen + Orders (single module for preview)
// // - Exports named components: KitchenPage, OrdersPage
// // - Default export renders a small tab switcher so you can
// //   preview both in this canvas without duplicate imports.
// // Copy KitchenPage to:   app/(protected)/coffe/kitchen/page.tsx
// // Copy OrdersPage  to:   app/(protected)/coffe/orders/page.tsx
// // ==============================================
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";

// // Tailwind helper (no external deps)
// function cn(...classes: Array<string | false | null | undefined>) {
//   return classes.filter(Boolean).join(" ");
// }

// // ---------------------------- Shared Types ----------------------------

// type Station = "kitchen" | "bar" | "barista"; // Cocina / Bebidas /  Cafetería

// type KitchenStatus = "new" | "preparing" | "ready" | "served" | "cancelled";

// type KitchenItemOption = { type: "variant" | "extra"; name: string };

// type KitchenItem = {
//   name: string;
//   qty: number;
//   station: Station;
//   options?: KitchenItemOption[];
//   notes?: string;
// };

// type KitchenOrder = {
//   id: string;
//   code: string; // ticket
//   table?: string;
//   serviceType: "dinein" | "takeaway";
//   createdAt: string; // ISO
//   status: KitchenStatus;
//   items: KitchenItem[];
// };

// const STATUS_META: Record<KitchenStatus, { label: string; dot: string }> = {
//   new: { label: "Nuevo", dot: "bg-emerald-500" },
//   preparing: { label: "Preparando", dot: "bg-amber-500" },
//   ready: { label: "Listo", dot: "bg-blue-500" },
//   served: { label: "Entregado", dot: "bg-gray-500" },
//   cancelled: { label: "Cancelado", dot: "bg-rose-500" },
// };

// // ---------------------------- Mock Data ----------------------------

// const MOCK_ORDERS: KitchenOrder[] = [
//   {
//     id: "o101",
//     code: "#101",
//     table: "Mesa 4",
//     serviceType: "dinein",
//     createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min
//     status: "new",
//     items: [
//       {
//         name: "Completos (Italiano)",
//         qty: 2,
//         station: "kitchen",
//         options: [{ type: "extra", name: "extra tomate" }],
//         notes: "uno sin mayo",
//       },
//       { name: "Coca Cola", qty: 1, station: "bar" },
//     ],
//   },
//   {
//     id: "o102",
//     code: "#102",
//     serviceType: "takeaway",
//     createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
//     status: "preparing",
//     items: [{ name: "Cappuccino", qty: 2, station: "barista" }],
//   },
//   {
//     id: "o103",
//     code: "#103",
//     table: "Mesa 2",
//     serviceType: "dinein",
//     createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
//     status: "ready",
//     items: [
//       { name: "Brownie", qty: 1, station: "kitchen" },
//       {
//         name: "Completos (Simple)",
//         qty: 1,
//         station: "kitchen",
//         notes: "sin tomate",
//       },
//     ],
//   },
// ];

// // ---------------------------- Shared Utils ----------------------------

// function timeAgo(iso: string) {
//   const ms = Date.now() - new Date(iso).getTime();
//   const m = Math.max(0, Math.round(ms / 60000));
//   return m <= 1 ? "hace 1 min" : `hace ${m} min`;
// }

// // tiny beep using WebAudio (no assets)
// function playBeep() {
//   if (typeof window === "undefined") return;
//   const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
//   const o = ctx.createOscillator();
//   const g = ctx.createGain();
//   o.type = "sine";
//   o.frequency.value = 880; // Hz
//   o.connect(g);
//   g.connect(ctx.destination);
//   g.gain.value = 0.05; // soft
//   o.start();
//   setTimeout(() => {
//     o.stop();
//     ctx.close();
//   }, 220);
// }

// // open a small print window for a given order & items
// function printTicket(order: KitchenOrder, items: KitchenItem[]) {
//   const w = window.open("", "PRINT", "height=600,width=380");
//   if (!w) return;
//   const css = `
//     <style>
//       *{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
//       body{ margin:0; padding:12px; width:280px; }
//       h1{ font-size:16px; margin:0 0 6px 0; }
//       .muted{ color:#555; font-size:12px }
//       .row{ display:flex; justify-content:space-between; font-size:14px; }
//       hr{ border:none; border-top:1px dashed #999; margin:8px 0; }
//       ul{ list-style:none; padding:0; margin:0; }
//       li{ margin:6px 0; font-size:14px }
//       .notes{ font-size:12px; color:#444; font-style:italic }
//     </style>`;
//   const html = `
//     ${css}
//     <h1>Ticket ${order.code}</h1>
//     <div class="muted">${new Date(order.createdAt).toLocaleString()} · ${order.serviceType}${order.table ? ` · ${order.table}` : ""}</div>
//     <hr/>
//     <ul>
//       ${items
//         .map(
//           (it) => `<li><div class="row"><span>${it.qty}× ${it.name}</span></div>
//         ${it.options?.length ? `<div class="muted">extras: ${it.options.map((o) => o.name).join(", ")}</div>` : ""}
//         ${it.notes ? `<div class="notes">${it.notes}</div>` : ""}
//       </li>`,
//         )
//         .join("")}
//     </ul>
//     <hr/>
//     <div class="muted">Gracias ✨</div>
//   `;
//   w.document.write(html);
//   w.document.close();
//   w.focus();
//   w.print();
//   w.close();
// }

// // ============================================================================
// // Kitchen Page (Kanban)
// // ============================================================================

// export function KitchenPage() {
//   const [orders, setOrders] = useState<KitchenOrder[]>(MOCK_ORDERS);
//   const [search, setSearch] = useState("");
//   const [showDone, setShowDone] = useState(false);
//   const [dragId, setDragId] = useState<string | null>(null);
//   const [sortByPriority, setSortByPriority] = useState(true);
//   const [stations, setStations] = useState<Record<Station, boolean>>({
//     kitchen: true,
//     bar: true,
//     barista: true,
//   });
//   const [soundOn, setSoundOn] = useState(true);
//   const prevCount = useRef<number>(orders.length);

//   // Detect new orders (simulate)
//   useEffect(() => {
//     if (!soundOn) return;
//     if (orders.length > prevCount.current) playBeep();
//     prevCount.current = orders.length;
//   }, [orders.length, soundOn]);

//   const columns: KitchenStatus[] = showDone
//     ? ["new", "preparing", "ready", "served", "cancelled"]
//     : ["new", "preparing", "ready"];

//   // Filter by search + station (within items). If an order has no items for selected stations, it's hidden.
//   const filtered = useMemo(() => {
//     const q = search.toLowerCase();
//     const activeStations = (Object.keys(stations) as Station[]).filter(
//       (s) => stations[s],
//     );
//     return orders
//       .map((o) => ({
//         ...o,
//         items: o.items.filter((it) => activeStations.includes(it.station)),
//       }))
//       .filter((o) => o.items.length > 0)
//       .filter(
//         (o) =>
//           !q ||
//           o.code.toLowerCase().includes(q) ||
//           (o.table?.toLowerCase() ?? "").includes(q) ||
//           o.items.some((it) => it.name.toLowerCase().includes(q)),
//       );
//   }, [orders, search, stations]);

//   function setStatus(id: string, status: KitchenStatus) {
//     setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
//   }
//   function advance(id: string) {
//     setOrders((prev) =>
//       prev.map((o) => {
//         if (o.id !== id) return o;
//         const flow: KitchenStatus[] = ["new", "preparing", "ready", "served"];
//         const i = flow.indexOf(o.status);
//         return { ...o, status: flow[Math.min(flow.length - 1, i + 1)] };
//       }),
//     );
//   }
//   function revert(id: string) {
//     setOrders((prev) =>
//       prev.map((o) => {
//         if (o.id !== id) return o;
//         const flow: KitchenStatus[] = ["new", "preparing", "ready", "served"];
//         const i = flow.indexOf(o.status);
//         return { ...o, status: flow[Math.max(0, i - 1)] };
//       }),
//     );
//   }

//   // Simulate new order to test sound
//   function addMockOrder() {
//     const n = orders.length + 100;
//     setOrders((prev) => [
//       ...prev,
//       {
//         id: `o${n}`,
//         code: `#${n}`,
//         serviceType: Math.random() > 0.5 ? "dinein" : "takeaway",
//         createdAt: new Date().toISOString(),
//         status: "new",
//         items: [
//           {
//             name: "Completos (Italiano)",
//             qty: 1 + Math.floor(Math.random() * 2),
//             station: "kitchen",
//           },
//           { name: "Cappuccino", qty: 1, station: "barista" },
//         ],
//       },
//     ]);
//   }

//   function priorityColor(iso: string) {
//     const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
//     if (m >= 10) return "bg-rose-500"; // high
//     if (m >= 5) return "bg-amber-500"; // medium
//     return "bg-emerald-500"; // low
//   }

//   return (
//     <div className="min-h-[calc(100vh-70px)] bg-gray-50 p-4 dark:bg-gray-900">
//       <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//         <h1 className="text-xl font-semibold">Cocina</h1>
//         <div className="flex items-center gap-2">
//           {/* Stations filter */}
//           {(["kitchen", "bar", "barista"] as Station[]).map((s) => (
//             <button
//               key={s}
//               onClick={() => setStations((st) => ({ ...st, [s]: !st[s] }))}
//               className={cn(
//                 "rounded-xl border px-3 py-2 text-sm",
//                 stations[s]
//                   ? "border-emerald-600 bg-emerald-600 text-white"
//                   : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
//               )}
//             >
//               {s === "kitchen" ? "Cocina" : s === "bar" ? "Bar" : "Cafetería"}
//             </button>
//           ))}
//           <label className="ml-2 flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={sortByPriority}
//               onChange={(e) => setSortByPriority(e.target.checked)}
//             />
//             Ver por prioridad
//           </label>
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={showDone}
//               onChange={(e) => setShowDone(e.target.checked)}
//             />
//             Mostrar servidos/cancelados
//           </label>
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={soundOn}
//               onChange={(e) => setSoundOn(e.target.checked)}
//             />
//             Sonido
//           </label>
//           <button
//             onClick={addMockOrder}
//             className="rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
//           >
//             Simular pedido
//           </button>
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Buscar #ticket, mesa o producto"
//             className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
//         {columns.map((status) => {
//           let list = filtered.filter((o) => o.status === status);
//           if (sortByPriority) {
//             list = list.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); // oldest first => highest priority
//           }
//           return (
//             <div
//               key={status}
//               className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
//             >
//               <div className="mb-3 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <span
//                     className={cn(
//                       "h-2 w-2 rounded-full",
//                       STATUS_META[status].dot,
//                     )}
//                   />
//                   <h2 className="font-semibold">{STATUS_META[status].label}</h2>
//                 </div>
//                 <span className="text-xs text-gray-500">{list.length}</span>
//               </div>

//               <div
//                 className="min-h-[200px] rounded-xl bg-gray-50 p-2 dark:bg-gray-900"
//                 onDragOver={(e) => e.preventDefault()}
//                 onDrop={() => {
//                   if (dragId) setStatus(dragId, status);
//                   setDragId(null);
//                 }}
//               >
//                 <div className="space-y-2">
//                   {list.map((o) => (
//                     <article
//                       key={o.id}
//                       draggable
//                       onDragStart={() => setDragId(o.id)}
//                       className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
//                     >
//                       <header className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <span className="text-sm font-semibold">
//                             {o.code}
//                           </span>
//                           {o.table && (
//                             <span className="text-xs text-gray-500">
//                               • {o.table}
//                             </span>
//                           )}
//                           <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
//                             {o.serviceType === "dinein" ? "🍽️" : "👜"}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <span
//                             className={cn(
//                               "h-2 w-2 rounded-full",
//                               priorityColor(o.createdAt),
//                             )}
//                             title={`Prioridad ${timeAgo(o.createdAt)}`}
//                           />
//                           <span className="text-xs text-gray-500">
//                             {timeAgo(o.createdAt)}
//                           </span>
//                         </div>
//                       </header>

//                       <ul className="mt-2 text-sm">
//                         {o.items.map((it, idx) => (
//                           <li key={idx} className="py-1">
//                             <div className="flex items-start justify-between">
//                               <span className="font-medium">
//                                 {it.qty}× {it.name}
//                               </span>
//                               <span className="text-[11px] text-gray-500">
//                                 {it.station === "kitchen"
//                                   ? "Cocina"
//                                   : it.station === "bar"
//                                     ? "Bar"
//                                     : "Cafetería"}
//                               </span>
//                             </div>
//                             {((it.options && it.options.length > 0) ||
//                               it.notes) && (
//                               <div className="mt-1 text-[12px] text-gray-600">
//                                 {it.options?.length ? (
//                                   <div>
//                                     <span className="mr-1">• Extras:</span>
//                                     {it.options.map((op, i) => (
//                                       <span key={i}>
//                                         {op.name}
//                                         {i < (it.options?.length ?? 0) - 1
//                                           ? ", "
//                                           : ""}
//                                       </span>
//                                     ))}
//                                   </div>
//                                 ) : null}
//                                 {it.notes && <div>• Obs: {it.notes}</div>}
//                               </div>
//                             )}
//                           </li>
//                         ))}
//                       </ul>

//                       <footer className="mt-3 flex items-center justify-between gap-2">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => revert(o.id)}
//                             className="rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-700"
//                           >
//                             ← Atrás
//                           </button>
//                           <button
//                             onClick={() => advance(o.id)}
//                             className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
//                           >
//                             Siguiente →
//                           </button>
//                         </div>
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => printTicket(o, o.items)}
//                             className="rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-700"
//                           >
//                             🖨️ Ticket
//                           </button>
//                           <button
//                             onClick={() => setStatus(o.id, "cancelled")}
//                             className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700"
//                           >
//                             Cancelar
//                           </button>
//                           {o.status !== "served" && (
//                             <button
//                               onClick={() => setStatus(o.id, "served")}
//                               className="rounded-lg border border-blue-300 px-2 py-1 text-xs text-blue-700"
//                             >
//                               Entregado
//                             </button>
//                           )}
//                         </div>
//                       </footer>
//                     </article>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ============================================================================
// // Orders Page (Table)
// // ============================================================================

// export function OrdersPage() {
//   const [orders, setOrders] = useState<(KitchenOrder & { total?: number })[]>([
//     ...MOCK_ORDERS.map((o) => ({
//       ...o,
//       total: o.items.reduce((s, it) => s + it.qty * 3, 0),
//     })),
//     {
//       id: "o104",
//       code: "#104",
//       serviceType: "takeaway",
//       createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
//       status: "new",
//       items: [{ name: "Cappuccino", qty: 1, station: "barista" }],
//       total: 3,
//     },
//   ]);
//   const [statusFilter, setStatusFilter] = useState<KitchenStatus | "all">(
//     "all",
//   );
//   const [q, setQ] = useState("");
//   const [selected, setSelected] = useState<Set<string>>(new Set());
//   const [stations, setStations] = useState<Record<Station, boolean>>({
//     kitchen: true,
//     bar: true,
//     barista: true,
//   });
//   const [sortByPriority, setSortByPriority] = useState(false);
//   const [soundOn, setSoundOn] = useState(true);
//   const prevCount = useRef<number>(orders.length);

//   useEffect(() => {
//     if (!soundOn) return;
//     if (orders.length > prevCount.current) playBeep();
//     prevCount.current = orders.length;
//   }, [orders.length, soundOn]);

//   const visible = useMemo(() => {
//     const query = q.toLowerCase();
//     const activeStations = (Object.keys(stations) as Station[]).filter(
//       (s) => stations[s],
//     );
//     let arr = orders
//       .map((o) => ({
//         ...o,
//         items: o.items.filter((it) => activeStations.includes(it.station)),
//       }))
//       .filter((o) => o.items.length > 0)
//       .filter(
//         (o) =>
//           (statusFilter === "all" || o.status === statusFilter) &&
//           (!query ||
//             o.code.toLowerCase().includes(query) ||
//             o.items.some((it) => it.name.toLowerCase().includes(query))),
//       );
//     if (sortByPriority)
//       arr = arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
//     return arr;
//   }, [orders, statusFilter, q, stations, sortByPriority]);

//   function toggle(id: string) {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   }
//   function setStatus(id: string, status: KitchenStatus) {
//     setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
//   }
//   function bulkSetStatus(status: KitchenStatus) {
//     setOrders((prev) =>
//       prev.map((o) => (selected.has(o.id) ? { ...o, status } : o)),
//     );
//     setSelected(new Set());
//   }

//   return (
//     <div className="min-h-[calc(100vh-70px)] bg-gray-50 p-4 dark:bg-gray-900">
//       <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//         <h1 className="text-xl font-semibold">Pedidos</h1>
//         <div className="flex items-center gap-2">
//           {(["kitchen", "bar", "barista"] as Station[]).map((s) => (
//             <button
//               key={s}
//               onClick={() => setStations((st) => ({ ...st, [s]: !st[s] }))}
//               className={cn(
//                 "rounded-xl border px-3 py-2 text-sm",
//                 stations[s]
//                   ? "border-emerald-600 bg-emerald-600 text-white"
//                   : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
//               )}
//             >
//               {s === "kitchen" ? "Cocina" : s === "bar" ? "Bar" : "Cafetería"}
//             </button>
//           ))}
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value as any)}
//             className="rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
//           >
//             <option value="all">Todos</option>
//             {(
//               ["new", "preparing", "ready", "served", "cancelled"] as const
//             ).map((s) => (
//               <option key={s} value={s}>
//                 {STATUS_META[s].label}
//               </option>
//             ))}
//           </select>
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={sortByPriority}
//               onChange={(e) => setSortByPriority(e.target.checked)}
//             />
//             Ordenar por prioridad
//           </label>
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={soundOn}
//               onChange={(e) => setSoundOn(e.target.checked)}
//             />
//             Sonido
//           </label>
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Buscar #ticket o producto"
//             className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
//           />
//         </div>
//       </div>

//       {/* Bulk actions */}
//       <div className="mb-2 flex items-center gap-2">
//         <span className="text-xs text-gray-500">
//           Seleccionados: {selected.size}
//         </span>
//         <div className="flex gap-2">
//           {(["new", "preparing", "ready", "served", "cancelled"] as const).map(
//             (s) => (
//               <button
//                 key={s}
//                 onClick={() => bulkSetStatus(s)}
//                 className="rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-700"
//               >
//                 {STATUS_META[s].label}
//               </button>
//             ),
//           )}
//         </div>
//       </div>

//       <div className="overflow-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="text-left text-xs text-gray-500">
//               <th className="py-2 pl-3">
//                 <input
//                   type="checkbox"
//                   onChange={(e) => {
//                     const checked = e.target.checked;
//                     setSelected(
//                       checked ? new Set(visible.map((o) => o.id)) : new Set(),
//                     );
//                   }}
//                 />
//               </th>
//               <th className="py-2">Ticket</th>
//               <th className="py-2">Fecha</th>
//               <th className="py-2">Canal</th>
//               <th className="py-2">Estaciones</th>
//               <th className="py-2">Detalle</th>
//               <th className="py-2 text-right">Total</th>
//               <th className="py-2 pr-3 text-right">Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {visible.map((o) => (
//               <tr
//                 key={o.id}
//                 className="border-t border-gray-100 dark:border-gray-700/50"
//               >
//                 <td className="py-2 pl-3 align-top">
//                   <input
//                     type="checkbox"
//                     checked={selected.has(o.id)}
//                     onChange={() => toggle(o.id)}
//                   />
//                 </td>
//                 <td className="py-2 align-top font-semibold">{o.code}</td>
//                 <td className="py-2 align-top text-xs text-gray-500">
//                   {new Date(o.createdAt).toLocaleString()}
//                 </td>
//                 <td className="py-2 align-top capitalize">{o.serviceType}</td>
//                 <td className="py-2 align-top text-xs">
//                   {Array.from(new Set(o.items.map((i) => i.station))).map(
//                     (s, i) => (
//                       <span
//                         key={i}
//                         className="mr-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700"
//                       >
//                         {s === "kitchen"
//                           ? "Cocina"
//                           : s === "bar"
//                             ? "Bar"
//                             : "Cafetería"}
//                       </span>
//                     ),
//                   )}
//                 </td>
//                 <td className="py-2 align-top">
//                   <ul className="text-xs text-gray-700 dark:text-gray-300">
//                     {o.items.map((it, i) => (
//                       <li key={i}>
//                         {it.qty}× {it.name}
//                       </li>
//                     ))}
//                   </ul>
//                 </td>
//                 <td className="py-2 text-right align-top">
//                   ${(o.total ?? 0).toFixed(2)}
//                 </td>
//                 <td className="py-2 pr-3 text-right align-top">
//                   <div className="flex justify-end gap-2">
//                     <select
//                       value={o.status}
//                       onChange={(e) =>
//                         setStatus(o.id, e.target.value as KitchenStatus)
//                       }
//                       className={cn(
//                         "rounded-lg px-2 py-1 text-xs",
//                         "bg-gray-100 dark:bg-gray-700",
//                       )}
//                     >
//                       {(
//                         [
//                           "new",
//                           "preparing",
//                           "ready",
//                           "served",
//                           "cancelled",
//                         ] as const
//                       ).map((s) => (
//                         <option key={s} value={s}>
//                           {STATUS_META[s].label}
//                         </option>
//                       ))}
//                     </select>
//                     <button
//                       onClick={() => printTicket(o, o.items)}
//                       className="rounded-lg border border-gray-200 px-2 py-1 text-xs dark:border-gray-700"
//                     >
//                       🖨️
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // ============================================================================
// // Demo Switcher (default export for canvas preview)
// // ============================================================================

// export default function KitchenOrdersDemo() {
//   const [tab, setTab] = useState<"kitchen" | "orders">("kitchen");
//   return (
//     <div className="p-3">
//       <div className="mb-3 flex gap-2">
//         <button
//           onClick={() => setTab("kitchen")}
//           className={cn(
//             "rounded-xl border px-3 py-2",
//             tab === "kitchen"
//               ? "border-emerald-600 bg-emerald-600 text-white"
//               : "border-gray-200 bg-white",
//           )}
//         >
//           Cocina
//         </button>
//         <button
//           onClick={() => setTab("orders")}
//           className={cn(
//             "rounded-xl border px-3 py-2",
//             tab === "orders"
//               ? "border-emerald-600 bg-emerald-600 text-white"
//               : "border-gray-200 bg-white",
//           )}
//         >
//           Pedidos
//         </button>
//       </div>
//       {tab === "kitchen" ? <KitchenPage /> : <OrdersPage />}
//     </div>
//   );
// }

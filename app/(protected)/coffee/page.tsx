"use client";
import React, { useMemo, useState } from "react";

// tiny class combiner (no external deps)
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// -----------------------------------------------------------------------------
// Mock data (replace with Supabase data)
// -----------------------------------------------------------------------------

type OrderItem = {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number; // final price (incl. variants/extras)
};

type Order = {
  id: string;
  customerId?: string;
  createdAt: string; // ISO date
  items: OrderItem[];
  discount?: number; // absolute
  tax?: number; // absolute
  total: number; // grand total paid
  channel: "dinein" | "takeaway";
  status: "paid" | "refunded" | "pending";
};

const ORDERS: Order[] = [
  {
    id: "o1",
    customerId: "c1",
    createdAt: new Date().toISOString(),
    items: [
      { productId: "p16", name: "Completos", qty: 2, unitPrice: 3.6 },
      { productId: "p15", name: "Cappuccino", qty: 1, unitPrice: 3.0 },
    ],
    discount: 0,
    tax: 0,
    total: 10.2,
    channel: "dinein",
    status: "paid",
  },
  {
    id: "o2",
    customerId: "c2",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    items: [
      { productId: "p15", name: "Cappuccino", qty: 2, unitPrice: 3.0 },
      { productId: "p17", name: "Brownie", qty: 1, unitPrice: 2.9 },
    ],
    discount: 0.5,
    tax: 0,
    total: 8.4,
    channel: "takeaway",
    status: "paid",
  },
  {
    id: "o3",
    customerId: "c3",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    items: [
      { productId: "p16", name: "Completos", qty: 1, unitPrice: 3.1 },
      { productId: "p9", name: "Coca Cola", qty: 1, unitPrice: 3.0 },
    ],
    discount: 0,
    tax: 0,
    total: 6.1,
    channel: "dinein",
    status: "paid",
  },
  {
    id: "o4",
    customerId: "c1",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    items: [
      { productId: "p15", name: "Cappuccino", qty: 1, unitPrice: 3.0 },
      { productId: "p17", name: "Brownie", qty: 2, unitPrice: 2.9 },
    ],
    discount: 0,
    tax: 0,
    total: 8.8,
    channel: "takeaway",
    status: "paid",
  },
];

// mock previous period for growth comparisons
const PREV_TOTAL_SALES = 20.0; // example

// -----------------------------------------------------------------------------
// Small svg components
// -----------------------------------------------------------------------------

function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-40 w-full items-end gap-3">
      {values.map((v, i) => (
        <div key={i} className="grid flex-1">
          <div
            className="w-full self-end rounded-xl bg-gray-200 dark:bg-gray-700"
            style={{ height: `${(v / max) * 100}%` }}
          />
          <div className="mt-1 text-center text-[11px] text-gray-500">
            {labels[i]}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]",
        positive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700",
      )}
    >
      <span>{positive ? "▲" : "▼"}</span>
      <span>{Math.abs(value).toFixed(1)}%</span>
    </span>
  );
}

// -----------------------------------------------------------------------------
// Main dashboard page
// -----------------------------------------------------------------------------

export default function DashboardCoffee() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "weekly",
  );
  const [productFilter, setProductFilter] = useState("");

  // Derived metrics
  const metrics = useMemo(() => {
    const totalSales = ORDERS.reduce((s, o) => s + o.total, 0);
    const totalOrders = ORDERS.length;
    const itemsSold = ORDERS.reduce(
      (s, o) => s + o.items.reduce((x, it) => x + it.qty, 0),
      0,
    );
    const customers = new Set(ORDERS.map((o) => o.customerId).filter(Boolean))
      .size;
    const avgOrder = totalOrders ? totalSales / totalOrders : 0;

    const growthSales =
      totalSales && PREV_TOTAL_SALES
        ? ((totalSales - PREV_TOTAL_SALES) / PREV_TOTAL_SALES) * 100
        : 0;

    // simple net profit model using COGS% (coffee shop ~35%)
    const COGS_PCT = 0.35;
    const netProfit = totalSales * (1 - COGS_PCT);

    return {
      totalSales,
      totalOrders,
      itemsSold,
      customers,
      avgOrder,
      netProfit,
      growthSales,
    };
  }, []);

  // Chart data (sales per day for last 7 days)
  const chart = useMemo(() => {
    const labels: string[] = [];
    const sums: number[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(
        ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d.getDay()],
      );
      const sum = ORDERS.filter((o) => o.createdAt.slice(0, 10) === key).reduce(
        (s, o) => s + o.total,
        0,
      );
      sums.push(Number(sum.toFixed(2)));
    }
    return { labels, values: sums };
  }, []);

  // Favorite products
  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { name: string; qty: number; revenue: number }
    >();
    ORDERS.forEach((o) => {
      o.items.forEach((it) => {
        const cur = map.get(it.productId) || {
          name: it.name,
          qty: 0,
          revenue: 0,
        };
        cur.qty += it.qty;
        cur.revenue += it.qty * it.unitPrice;
        map.set(it.productId, cur);
      });
    });
    let arr = Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
    if (productFilter) {
      const q = productFilter.toLowerCase();
      arr = arr.filter((x) => x.name.toLowerCase().includes(q));
    }
    return arr.sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [productFilter]);

  // Recent orders
  const recent = useMemo(() => {
    return [...ORDERS]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6);
  }, []);

  return (
    <div className="min-h-[calc(100vh-70px)] bg-gray-50 p-4 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-gray-200 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex gap-1 text-xs">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-lg px-3 py-1",
                    period === p
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                  )}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">
            + New Order
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi
          title="Total Sales"
          value={metrics.totalSales}
          prefix="$"
          subtitle={<TrendBadge value={metrics.growthSales} />}
        />
        <Kpi
          title="Total Orders"
          value={metrics.totalOrders}
          suffix=" orders"
        />
        <Kpi title="Items Sold" value={metrics.itemsSold} suffix=" items" />
        <Kpi title="Customers" value={metrics.customers} suffix=" persons" />
        <Kpi title="Avg. Order" value={metrics.avgOrder} prefix="$" />
        <Kpi title="Net Profit" value={metrics.netProfit} prefix="$" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Analytics card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 xl:col-span-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>📈</span>
              <h2 className="font-semibold">Report Analytics</h2>
            </div>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <BarChart values={chart.values} labels={chart.labels} />
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <MiniStat
              label="Amount"
              value={`$${metrics.totalSales.toFixed(2)}`}
            />
            <MiniStat label="Orders" value={`${metrics.totalOrders}`} />
            <MiniStat
              label="Growth"
              value={<TrendBadge value={metrics.growthSales} />}
            />
          </div>
        </section>

        {/* Favorites / Top products */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⭐</span>
              <h2 className="font-semibold">Favorite Products</h2>
            </div>
            <input
              placeholder="Search"
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            />
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2">Product Name</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="py-2">{p.name}</td>
                    <td className="py-2 text-right">{p.qty}</td>
                    <td className="py-2 text-right">${p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Bottom grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent orders */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 xl:col-span-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center gap-2">
            <span>🧾</span>
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Channel</th>
                  <th className="py-2 text-right">Items</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-gray-100 dark:border-gray-700/50"
                  >
                    <td className="py-2">#{o.id}</td>
                    <td className="py-2">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 capitalize">{o.channel}</td>
                    <td className="py-2 text-right">
                      {o.items.reduce((s, it) => s + it.qty, 0)}
                    </td>
                    <td className="py-2 text-right">${o.total.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px]",
                          o.status === "paid" &&
                            "bg-emerald-100 text-emerald-700",
                          o.status === "pending" &&
                            "bg-amber-100 text-amber-700",
                          o.status === "refunded" &&
                            "bg-rose-100 text-rose-700",
                        )}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Breakdown card */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center gap-2">
            <span>🧮</span>
            <h2 className="font-semibold">Breakdown</h2>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span>Sales</span>
              <span>${metrics.totalSales.toFixed(2)}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Estimated COGS (35%)</span>
              <span>${(metrics.totalSales * 0.35).toFixed(2)}</span>
            </li>
            <li className="flex items-center justify-between border-t border-dashed border-gray-300 pt-2 font-semibold dark:border-gray-700">
              <span>Net Profit</span>
              <span>${metrics.netProfit.toFixed(2)}</span>
            </li>
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-xl border border-gray-200 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
              Export CSV
            </button>
            <button className="rounded-xl border border-gray-200 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
              Open Reports
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// UI fragments
// -----------------------------------------------------------------------------

function Kpi({
  title,
  value,
  prefix = "",
  suffix = "",
  subtitle,
}: {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  subtitle?: React.ReactNode;
}) {
  const formatted =
    (prefix ? prefix : "") +
    (typeof value === "number"
      ? value % 1 === 0
        ? value.toString()
        : value.toFixed(2)
      : value) +
    (suffix ? suffix : "");
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-1 text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{formatted}</div>
      {subtitle && <div className="mt-1">{subtitle}</div>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

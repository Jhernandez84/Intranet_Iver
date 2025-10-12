"use client";

import React, { useMemo, useState } from "react";
// -----------------------------------------------------------------------------
// POS mock data (replace with your DB data)
// -----------------------------------------------------------------------------

type CategoryKey =
  | "all"
  | "burger"
  | "fried"
  | "drink"
  | "coffee"
  | "dessert"
  | "other";

type PaymentMethod = "cash" | "creditCard" | "pending";

type Variant = {
  id: string;
  name: string;
  priceDelta: number; // + or - impact on base price
};

type Extra = {
  id: string;
  name: string;
  priceDelta: number; // + or - impact on base price
};

type Product = {
  id: string;
  name: string;
  price: number;
  img?: string;
  category: CategoryKey;
  variants?: Variant[]; // choose ONE (radio)
  extras?: Extra[]; // choose MANY (checkbox)
  allowNotes?: boolean; // free text observations
};

type CartItemOption = {
  kind: "variant" | "extra";
  id: string;
  name: string;
  priceDelta: number;
};

type CartItem = {
  product: Product;
  qty: number;
  unitPrice: number; // price of ONE considering deltas
  options: CartItemOption[];
  notes?: string;
};

const CATEGORIES: { key: CategoryKey; label: string; icon?: string }[] = [
  { key: "all", label: "All Menu", icon: "🍽️" },
  { key: "burger", label: "Burger", icon: "🍔" },
  { key: "fried", label: "Fried Chicken", icon: "🍗" },
  { key: "drink", label: "Drink", icon: "🥤" },
  { key: "coffee", label: "Coffee", icon: "☕" },
  { key: "dessert", label: "Dessert", icon: "🍰" },
  { key: "other", label: "Other Menu", icon: "📦" },
];

const PRODUCTS: Product[] = [
  { id: "p1", name: "Deluxe Crispy Burger", price: 6.99, category: "burger" },
  { id: "p2", name: "Classic Crispy Burger", price: 4.75, category: "burger" },
  { id: "p3", name: "Special Crispy Burger", price: 5.75, category: "burger" },
  { id: "p4", name: "Special Burger", price: 6.49, category: "burger" },
  { id: "p5", name: "Spicy Chicken Burger", price: 5.49, category: "burger" },
  { id: "p6", name: "Cheeseburger", price: 5.2, category: "burger" },
  { id: "p7", name: "Combo Drums", price: 8.99, category: "fried" },
  { id: "p8", name: "Double Cheese", price: 7.25, category: "burger" },
  { id: "p9", name: "Coca Cola", price: 3.0, category: "drink" },
  { id: "p10", name: "Classic Cheese", price: 4.99, category: "burger" },
  { id: "p11", name: "3 Cheese Wings", price: 3.49, category: "fried" },
  { id: "p12", name: "Sprite", price: 3.0, category: "drink" },
  { id: "p13", name: "Chocolate Milkshake", price: 3.5, category: "drink" },
  { id: "p14", name: "3 Drumstick", price: 4.75, category: "fried" },
  { id: "p15", name: "Cappuccino", price: 3.0, category: "coffee" },
  // Ejemplo con variantes/observaciones: "Completos"
  {
    id: "p16",
    name: "Completos",
    price: 2.9,
    category: "other",
    variants: [
      { id: "v1", name: "Italiano (palta-tomate-mayo)", priceDelta: 0.6 },
      { id: "v2", name: "A lo pobre (huevo-cebolla)", priceDelta: 1.0 },
      { id: "v3", name: "Simple", priceDelta: 0 },
    ],
    extras: [
      { id: "e1", name: "Extra tomate", priceDelta: 0.2 },
      { id: "e2", name: "Sin tomate (solo mayo/palta)", priceDelta: 0 },
      { id: "e3", name: "Extra palta", priceDelta: 0.5 },
      { id: "e4", name: "Extra mayo", priceDelta: 0.15 },
      { id: "e5", name: "Queso", priceDelta: 0.4 },
    ],
    allowNotes: true,
  },
  { id: "p17", name: "Brownie", price: 2.9, category: "dessert" },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function hasOptions(p: Product) {
  return Boolean(
    (p.variants && p.variants.length) ||
      (p.extras && p.extras.length) ||
      p.allowNotes,
  );
}

// -----------------------------------------------------------------------------
// Main POS component
// -----------------------------------------------------------------------------

export default function CoffeePosPage() {
  const [category, setCategory] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [serviceType, setServiceType] = useState<"dinein" | "takeaway">(
    "dinein",
  );
  const [voucher, setVoucher] = useState<number>(0);
  const TAX_RATE = 0.0; // 0.19 para IVA 19%

  // Modal state
  const [productModal, setProductModal] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [paymentMethod, setPaymenMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState<string>("");
  const [qty, setQty] = useState<number>(1);

  const visibleProducts = useMemo(() => {
    const text = query.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (text.length === 0 || p.name.toLowerCase().includes(text)),
    );
  }, [category, query]);

  function addToCartSimple(p: Product) {
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.product.id === p.id && (c.options?.length ?? 0) === 0 && !c.notes,
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { product: p, qty: 1, unitPrice: p.price, options: [] }];
    });
  }

  function openProduct(p: Product) {
    if (hasOptions(p)) {
      setProductModal(p);
      // sane defaults
      setSelectedVariantId(p.variants?.[0]?.id ?? null);
      setSelectedExtras(new Set());
      setNotes("");
      setQty(1);
    } else {
      addToCartSimple(p);
    }
  }

  // --- Per-item controls (by index) ---
  function incAt(index: number) {
    setCart((prev) =>
      prev.map((c, i) => (i === index ? { ...c, qty: c.qty + 1 } : c)),
    );
  }
  function decAt(index: number) {
    setCart((prev) =>
      prev
        .map((c, i) =>
          i === index ? { ...c, qty: Math.max(0, c.qty - 1) } : c,
        )
        .filter((c) => c.qty > 0),
    );
  }
  function removeAt(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }
  function clearCart() {
    setCart([]);
    setVoucher(0);
  }

  // Pricing helpers for modal
  const variantDelta = useMemo(() => {
    if (!productModal?.variants || !selectedVariantId) return 0;
    const v = productModal.variants.find((x) => x.id === selectedVariantId);
    return v?.priceDelta ?? 0;
  }, [productModal, selectedVariantId]);

  const extrasTotal = useMemo(() => {
    if (!productModal?.extras) return 0;
    return productModal.extras
      .filter((e) => selectedExtras.has(e.id))
      .reduce((sum, e) => sum + e.priceDelta, 0);
  }, [productModal, selectedExtras]);

  const modalUnitPrice = useMemo(() => {
    if (!productModal) return 0;
    return Number((productModal.price + variantDelta + extrasTotal).toFixed(2));
  }, [productModal, variantDelta, extrasTotal]);

  const subtotal = useMemo(
    () => cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0),
    [cart],
  );
  const tax = subtotal * TAX_RATE;
  const total = Math.max(0, subtotal + tax - voucher);

  function toggleExtra(id: string) {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmAdd() {
    if (!productModal) return;
    const variant: CartItemOption | undefined =
      productModal.variants && selectedVariantId
        ? (() => {
            const v = productModal.variants!.find(
              (x) => x.id === selectedVariantId,
            )!;
            return {
              kind: "variant",
              id: v.id,
              name: v.name,
              priceDelta: v.priceDelta,
            };
          })()
        : undefined;
    const extras: CartItemOption[] = (productModal.extras ?? [])
      .filter((e) => selectedExtras.has(e.id))
      .map((e) => ({
        kind: "extra",
        id: e.id,
        name: e.name,
        priceDelta: e.priceDelta,
      }));

    const options: CartItemOption[] = [variant, ...extras].filter(
      Boolean,
    ) as CartItemOption[];

    setCart((prev) => [
      ...prev,
      {
        product: productModal,
        qty,
        unitPrice: modalUnitPrice,
        options,
        notes: notes.trim() || undefined,
      },
    ]);

    // close modal
    setProductModal(null);
  }

  // ---------------- Grouped view by product (accordion) ----------------
  type Group = {
    product: Product;
    indices: number[]; // indexes in cart array
    totalQty: number;
    totalAmount: number;
    hasObs: boolean;
  };

  const grouped = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    cart.forEach((c, idx) => {
      const key = c.product.id;
      if (!map.has(key)) {
        map.set(key, {
          product: c.product,
          indices: [],
          totalQty: 0,
          totalAmount: 0,
          hasObs: false,
        });
      }
      const g = map.get(key)!;
      g.indices.push(idx);
      g.totalQty += c.qty;
      g.totalAmount += c.unitPrice * c.qty;
      g.hasObs = g.hasObs || !!c.notes || c.options.length > 0;
    });
    return Array.from(map.values());
  }, [cart]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (pid: string) =>
    setOpenGroups((s) => ({ ...s, [pid]: !s[pid] }));

  return (
    <div className="flex h-full gap-3">
      {/* LEFT: Categories */}
      <aside className="w-[200px] shrink-0 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <ul className="active flex-column space-y mb-4 space-y-4 text-sm font-medium text-gray-500 md:me-4 md:mb-0 dark:text-gray-400">
          {CATEGORIES.map((c) => {
            return (
              <li key={c.key}>
                <button
                  className={`inline-flex w-full cursor-pointer items-center rounded-lg px-4 py-3 ${
                    c.key === category
                      ? "disable bg-blue-700 text-white dark:bg-blue-600"
                      : "border border-gray-700 bg-gray-50 hover:bg-gray-400 hover:text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-900 dark:hover:text-white"
                  } `}
                  onClick={() => setCategory(c.key)}
                >
                  <span className="pr-2">{c.icon}</span>
                  <span className="pr-2">{c.label}</span>
                  {/* {c.key === category ? <span>✅</span> : []} */}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* CENTER: Product search + grid */}
      <main className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Top bar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Burcar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 py-2 pr-3 pl-10 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
              />
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                🔎
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 overflow-auto pb-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visibleProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => openProduct(p)}
              className="group rounded-2xl border border-gray-200 bg-white p-3 text-left transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
                <span className="text-4xl">🍔</span>
              </div>
              <p className="mt-3 line-clamp-1 text-sm font-semibold">
                {p.name}
              </p>
              <p className="text-xs text-gray-500">${p.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </main>

      {/* RIGHT: Order summary */}
      <aside className="flex w-[380px] shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Tabs */}
        <div className="mt-3 flex rounded-xl bg-gray-100 p-1 text-xs font-medium dark:bg-gray-700">
          <button
            onClick={() => setServiceType("dinein")}
            className={`"flex-1 transition", serviceType === "dinein" ? "bg-white shadow" : "opacity-70" rounded-lg px-3 py-1 dark:bg-gray-800`}
          >
            Dine In
          </button>
          <button
            onClick={() => setServiceType("takeaway")}
            className={`"flex-1 transition", serviceType === "takeaway" ? "bg-white shadow" : "opacity-70" rounded-lg px-3 py-1 dark:bg-gray-800`}
          >
            Take Away
          </button>
        </div>

        {/* Cart grouped list (accordion) */}
        <div className="mt-3 flex-1 overflow-auto rounded-xl border border-gray-200 p-2 dark:border-gray-700">
          {cart.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm text-gray-500">
              <div>
                <div className="mb-2 text-4xl">🛍️</div>
                <p>No Order</p>
                <p className="text-xs">Tap a product to add it</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {grouped.map((g) => (
                <li
                  key={g.product.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleGroup(g.product.id)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2"
                  >
                    <div className="min-w-0 text-left">
                      <p className="line-clamp-1 text-sm font-semibold">
                        {g.product.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Cantidad total: {g.totalQty}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {g.hasObs && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                          Tiene observaciones
                        </span>
                      )}
                      <span className="text-sm font-semibold">
                        ${g.totalAmount.toFixed(2)}
                      </span>
                      <span
                        className={`"transition-transform", openGroups[g.product.id] ? "rotate-180" : "rotate-0"`}
                      >
                        ▾
                      </span>
                    </div>
                  </button>

                  {/* Body */}
                  {openGroups[g.product.id] && (
                    <div className="space-y-2 border-t border-gray-200 px-3 py-2 dark:border-gray-700">
                      {g.indices.map((i) => {
                        const c = cart[i];
                        return (
                          <div
                            key={`${c.product.id}-${i}`}
                            className="flex items-start justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">
                                ${c.unitPrice.toFixed(2)} x {c.qty}
                              </p>
                              {c.options.length > 0 && (
                                <ul className="mt-1 list-inside list-disc space-y-0.5 text-[11px] text-gray-500">
                                  {c.options.map((o) => (
                                    <li key={o.id}>
                                      {o.kind === "variant" ? "Var." : "Extra"}:{" "}
                                      {o.name}
                                      {o.priceDelta !== 0 && (
                                        <span>
                                          {" "}
                                          ({o.priceDelta > 0 ? "+" : ""}
                                          {o.priceDelta.toFixed(2)})
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {c.notes && (
                                <p className="mt-1 text-[11px] text-gray-600 italic">
                                  “{c.notes}”
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => decAt(i)}
                                className="h-7 w-7 rounded-lg border border-gray-200 dark:border-gray-700"
                                aria-label="decrease"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-xs">
                                {c.qty}
                              </span>
                              <button
                                onClick={() => incAt(i)}
                                className="h-7 w-7 rounded-lg border border-gray-200 dark:border-gray-700"
                                aria-label="increase"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeAt(i)}
                                className="ml-2 h-7 rounded-lg border border-red-300 px-2 text-[11px] text-red-600"
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary */}
        <div className="mt-3 space-y-2 rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Voucher</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={voucher}
                onChange={(e) => setVoucher(Number(e.target.value) || 0)}
                className="w-24 rounded-lg border border-gray-200 bg-white px-2 py-1 text-right dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-gray-300 pt-2 text-base font-semibold dark:border-gray-700">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            { label: "Efectivo", paymentIcon: "💵" },
            { label: "Tarjeta", paymentIcon: "💳" },
            { label: "Transferencia", paymentIcon: "🏦" },
            { label: "Pendiente", paymentIcon: "❓" },
          ].map((b) => (
            <button
              key={b.label}
              className="rounded-xl border border-gray-200 py-2 text-xs font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <span>{b.label}</span>
              <span>{b.paymentIcon}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={clearCart}
            className="rounded-xl border border-gray-200 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Limpiar
          </button>
          <button
            disabled={cart.length === 0}
            className={`inline-flex w-full items-center rounded-lg px-4 py-3 text-center ${
              cart.length === 0
                ? "disable cursor-not-allowed bg-blue-700 text-center text-white dark:bg-blue-600"
                : "cursor-pointer border border-gray-700 bg-green-700 hover:bg-gray-400 hover:text-white dark:bg-green-700 dark:text-center dark:hover:bg-green-500 dark:hover:text-white"
            } `}
            onClick={() =>
              alert(
                `Process ${serviceType} • Items: ${cart.length} • Total: $${total.toFixed(2)}`,
              )
            }
          >
            Pagar
          </button>
        </div>
      </aside>

      {/* PRODUCT MODAL */}
      {productModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <h3 className="text-base font-semibold">{productModal.name}</h3>
              <button
                onClick={() => setProductModal(null)}
                className="rounded-md px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] space-y-4 overflow-auto px-4 py-3">
              {/* Variants (radio) */}
              {productModal.variants && productModal.variants.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                    Variantes
                  </p>
                  <div className="space-y-2">
                    {productModal.variants.map((v) => (
                      <label
                        key={v.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 p-2 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="variant"
                            checked={selectedVariantId === v.id}
                            onChange={() => setSelectedVariantId(v.id)}
                          />
                          <span className="text-sm">{v.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {v.priceDelta >= 0 ? "+" : ""}
                          {v.priceDelta.toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Extras (checkbox) */}
              {productModal.extras && productModal.extras.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                    Extras
                  </p>
                  <div className="space-y-2">
                    {productModal.extras.map((e) => (
                      <label
                        key={e.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 p-2 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedExtras.has(e.id)}
                            onChange={() => toggleExtra(e.id)}
                          />
                          <span className="text-sm">{e.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {e.priceDelta >= 0 ? "+" : ""}
                          {e.priceDelta.toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {productModal.allowNotes && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                    Observaciones
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Ej: solo tomate, sin mayo…"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>
              )}

              {/* Qty & price */}
              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    −
                  </button>
                  <span className="w-10 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Precio unitario</p>
                  <p className="text-base font-semibold">
                    ${modalUnitPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
              <div className="text-sm">
                <span className="text-gray-500">Total</span>{" "}
                <span className="font-semibold">
                  ${(modalUnitPrice * qty).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setProductModal(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm dark:border-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAdd}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

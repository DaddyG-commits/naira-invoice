"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getInvoices, getBusiness, saveBusiness, upsertInvoice, deleteInvoice,
  type BusinessProfile,
} from "@/lib/storage";
import {
  type Invoice, type InvoiceItem, generateId, formatNaira, invoiceTotal,
} from "@/lib/types";

function whatsappLink(invoice: Invoice, publicUrl: string) {
  const total = formatNaira(invoiceTotal(invoice));
  const phone = invoice.customerPhone.replace(/\D/g, "");
  const intl = phone.startsWith("0") ? `234${phone.slice(1)}` : phone;
  const text = encodeURIComponent(
    `Hello ${invoice.customerName},\n\nInvoice from *${invoice.businessName}*\nAmount: *${total}*\nInvoice #: ${invoice.id}\n\nView & pay:\n${publicUrl}\n\nThank you!`
  );
  return `https://wa.me/${intl}?text=${text}`;
}

export default function HomePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [business, setBusiness] = useState<BusinessProfile>({ name: "My Shop" });
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [origin, setOrigin] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);

  const refresh = useCallback(() => {
    setInvoices(getInvoices());
    setBusiness(getBusiness());
  }, []);

  useEffect(() => {
    refresh();
    setOrigin(window.location.origin);
  }, [refresh]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const cleanItems = items.filter((i) => i.description.trim() && i.unitPrice > 0);
    if (!customerName.trim() || !customerPhone.trim() || cleanItems.length === 0) {
      alert("Fill customer name, phone, and at least one item.");
      return;
    }
    upsertInvoice({
      id: generateId(),
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: cleanItems,
      note: note.trim() || undefined,
      status: "pending",
      businessName: business.name,
      businessPhone: business.phone,
    });
    refresh();
    setShowForm(false);
    setCustomerName("");
    setCustomerPhone("");
    setNote("");
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
  }

  function setStatus(id: string, status: "pending" | "paid") {
    const inv = invoices.find((i) => i.id === id);
    if (inv) {
      upsertInvoice({ ...inv, status });
      refresh();
    }
  }

  const pending = invoices.filter((i) => i.status === "pending");
  const paid = invoices.filter((i) => i.status === "paid");
  const totalPending = pending.reduce((s, i) => s + invoiceTotal(i), 0);
  const totalPaid = paid.reduce((s, i) => s + invoiceTotal(i), 0);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg">₦</div>
            <div>
              <p className="font-semibold text-slate-900 leading-tight">NairaInvoice</p>
              <p className="text-xs text-slate-500">{business.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowSettings(true)} className="btn btn-secondary text-xs px-3 py-2">Settings</button>
            <button type="button" onClick={() => setShowForm(true)} className="btn btn-primary text-xs px-3 py-2">+ New Invoice</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{formatNaira(totalPending)}</p>
            <p className="text-xs text-slate-400">{pending.length} invoice(s)</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Paid</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{formatNaira(totalPaid)}</p>
            <p className="text-xs text-slate-400">{paid.length} invoice(s)</p>
          </div>
        </div>

        <div className="card border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-4">
          <p className="text-sm font-semibold text-emerald-800">For Nigerian SMBs</p>
          <p className="mt-1 text-xs text-slate-600">Create invoice → WhatsApp link → mark paid. ₦1,000–5,000/month or % per paid invoice.</p>
          <Link href="/pricing" className="mt-2 inline-block text-xs font-semibold text-emerald-700 hover:underline">View pricing →</Link>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent invoices</h2>
          {invoices.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-slate-500 text-sm">No invoices yet.</p>
              <button type="button" onClick={() => setShowForm(true)} className="btn btn-primary mt-4">Create your first invoice</button>
            </div>
          ) : (
            <ul className="space-y-3">
              {invoices.map((inv) => {
                const total = invoiceTotal(inv);
                const url = `${origin}/invoice/${inv.id}`;
                return (
                  <li key={inv.id} className="card p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 truncate">{inv.customerName}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        inv.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>{inv.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{inv.customerPhone} · #{inv.id}</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{formatNaira(total)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/invoice/${inv.id}`} className="btn btn-secondary text-xs py-1.5 px-3">View</Link>
                      {inv.status === "pending" && (
                        <>
                          <a href={whatsappLink(inv, url)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp text-xs py-1.5 px-3">WhatsApp</a>
                          <button type="button" onClick={() => setStatus(inv.id, "paid")} className="btn btn-primary text-xs py-1.5 px-3">Mark paid</button>
                        </>
                      )}
                      {inv.status === "paid" && (
                        <button type="button" onClick={() => setStatus(inv.id, "pending")} className="btn btn-secondary text-xs py-1.5 px-3">Undo paid</button>
                      )}
                      <button type="button" onClick={() => { if (confirm("Delete?")) { deleteInvoice(inv.id); refresh(); } }} className="btn text-xs py-1.5 px-3 text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="pt-4 pb-8 text-center text-xs text-slate-400">NairaInvoice · Data in browser localStorage</footer>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New Invoice</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 text-xl">×</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Customer name</label>
                <input className="input" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Adebayo Okoro" required />
              </div>
              <div>
                <label className="label">WhatsApp / Phone</label>
                <input className="input" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="08012345678" required />
              </div>
              <div>
                <label className="label">Items</label>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input className="input flex-1" placeholder="Description" value={item.description} onChange={(e) => setItems((p) => p.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))} />
                      <input className="input w-16" type="number" min={1} value={item.quantity} onChange={(e) => setItems((p) => p.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) || 1 } : it))} />
                      <input className="input w-24" type="number" min={0} placeholder="₦" value={item.unitPrice || ""} onChange={(e) => setItems((p) => p.map((it, i) => i === idx ? { ...it, unitPrice: Number(e.target.value) || 0 } : it))} />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setItems((p) => [...p, { description: "", quantity: 1, unitPrice: 0 }])} className="mt-2 text-sm text-emerald-600 font-medium">+ Add item</button>
              </div>
              <div>
                <label className="label">Note (optional)</label>
                <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Due in 3 days..." />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Create invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4">
          <div className="card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Business settings</h2>
              <button type="button" onClick={() => setShowSettings(false)} className="text-slate-400 text-xl">×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveBusiness(business); setShowSettings(false); }} className="space-y-4">
              <div>
                <label className="label">Business name</label>
                <input className="input" value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Business phone (optional)</label>
                <input className="input" value={business.phone || ""} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} placeholder="080..." />
              </div>
              <button type="submit" className="btn btn-primary w-full">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

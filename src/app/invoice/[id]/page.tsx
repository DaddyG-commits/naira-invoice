"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getInvoice, upsertInvoice } from "@/lib/storage";
import { type Invoice, formatNaira, invoiceTotal } from "@/lib/types";

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setInvoice(getInvoice(id) ?? null);
    setOrigin(window.location.origin);
  }, [id]);

  function markPaid() {
    if (!invoice) return;
    const updated = { ...invoice, status: "paid" as const };
    upsertInvoice(updated);
    setInvoice(updated);
  }

  if (invoice === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (invoice === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-600">Invoice not found.</p>
        <p className="text-xs text-slate-400 text-center max-w-sm">
          This demo stores invoices in the browser that created them. Open the same device/browser, or create a new invoice from the home page.
        </p>
        <Link href="/" className="btn btn-primary">
          Go home
        </Link>
      </div>
    );
  }

  const total = invoiceTotal(invoice);
  const phone = invoice.customerPhone.replace(/\D/g, "");
  const intl = phone.startsWith("0") ? `234${phone.slice(1)}` : phone;
  const waText = encodeURIComponent(
    `Hello ${invoice.customerName},\n\nInvoice from *${invoice.businessName}*\nAmount: *${formatNaira(total)}*\nInvoice #: ${invoice.id}\n\nView: ${origin}/invoice/${invoice.id}\n\nThank you!`
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline">
            ← NairaInvoice
          </Link>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
              invoice.status === "paid"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {invoice.status}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="card p-6 space-y-6">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">From</p>
            <p className="text-lg font-bold text-slate-900">{invoice.businessName}</p>
            {invoice.businessPhone && (
              <p className="text-sm text-slate-500">{invoice.businessPhone}</p>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bill to</p>
            <p className="font-semibold text-slate-900">{invoice.customerName}</p>
            <p className="text-sm text-slate-500">{invoice.customerPhone}</p>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Items</p>
            <ul className="space-y-2">
              {invoice.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-700">
                    {item.description}
                    {item.quantity > 1 && (
                      <span className="text-slate-400"> × {item.quantity}</span>
                    )}
                  </span>
                  <span className="font-medium text-slate-900 whitespace-nowrap">
                    {formatNaira(item.quantity * item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {invoice.note && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Note</p>
              <p className="text-sm text-slate-600 mt-1">{invoice.note}</p>
            </div>
          )}

          <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total</span>
            <span className="text-2xl font-bold text-emerald-700">{formatNaira(total)}</span>
          </div>

          <div className="text-xs text-slate-400">
            Invoice #{invoice.id} · {new Date(invoice.createdAt).toLocaleString("en-NG")}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {invoice.status === "pending" && (
            <>
              <a
                href={`https://wa.me/${intl}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp w-full"
              >
                Share via WhatsApp
              </a>
              <button type="button" onClick={markPaid} className="btn btn-primary w-full">
                Mark as paid
              </button>
            </>
          )}
          {invoice.status === "paid" && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center text-sm text-emerald-800 font-medium">
              ✓ This invoice has been paid
            </div>
          )}
          <Link href="/" className="btn btn-secondary w-full">
            Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

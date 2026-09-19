export type InvoiceStatus = "pending" | "paid" | "cancelled";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number; // in Naira (kobo not used for simplicity)
}

export interface Invoice {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string; // e.g. 08012345678
  items: InvoiceItem[];
  note?: string;
  status: InvoiceStatus;
  businessName: string;
  businessPhone?: string;
}

export function invoiceTotal(invoice: Invoice): number {
  return invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

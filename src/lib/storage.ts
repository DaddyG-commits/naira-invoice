"use client";

import type { Invoice } from "./types";

const STORAGE_KEY = "naira-invoice-v1";
const BUSINESS_KEY = "naira-invoice-business";

export interface BusinessProfile {
  name: string;
  phone?: string;
}

export function getBusiness(): BusinessProfile {
  if (typeof window === "undefined") return { name: "My Shop" };
  try {
    const raw = localStorage.getItem(BUSINESS_KEY);
    if (raw) return JSON.parse(raw) as BusinessProfile;
  } catch {
    /* ignore */
  }
  return { name: "My Shop" };
}

export function saveBusiness(profile: BusinessProfile) {
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(profile));
}

export function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Invoice[];
  } catch {
    return [];
  }
}

export function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function getInvoice(id: string): Invoice | undefined {
  return getInvoices().find((inv) => inv.id === id);
}

export function upsertInvoice(invoice: Invoice) {
  const list = getInvoices();
  const idx = list.findIndex((i) => i.id === invoice.id);
  if (idx >= 0) list[idx] = invoice;
  else list.unshift(invoice);
  saveInvoices(list);
}

export function deleteInvoice(id: string) {
  saveInvoices(getInvoices().filter((i) => i.id !== id));
}

import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "₦1,000",
    period: "/month",
    desc: "Solo traders & micro shops",
    features: ["Up to 30 invoices / month", "WhatsApp share links", "Mark paid", "Browser storage"],
  },
  {
    name: "Growth",
    price: "₦3,000",
    period: "/month",
    desc: "Busy small shops",
    features: [
      "Unlimited invoices",
      "WhatsApp + SMS links",
      "Simple reports",
      "Cloud backup (coming)",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "₦5,000",
    period: "/month",
    desc: "Teams & multi-outlet",
    features: [
      "Everything in Growth",
      "Multiple staff logins",
      "Payment gateway hooks",
      "Priority support",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
              ₦
            </div>
            <span className="font-semibold text-slate-900">NairaInvoice</span>
          </Link>
          <Link href="/" className="text-sm text-emerald-700 font-medium hover:underline">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Simple pricing for Nigerian SMBs</h1>
          <p className="mt-2 text-slate-600 max-w-xl mx-auto">
            Create invoice → WhatsApp link → mark paid. Subscribe monthly or pay a small % only when an invoice is marked paid.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card p-6 flex flex-col ${
                plan.highlighted ? "ring-2 ring-emerald-500 shadow-md" : ""
              }`}
            >
              {plan.highlighted && (
                <span className="self-start mb-2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase px-2 py-0.5">
                  Popular
                </span>
              )}
              <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{plan.desc}</p>
              <p className="mt-4">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 text-sm">{plan.period}</span>
              </p>
              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn mt-6 w-full ${
                  plan.highlighted ? "btn-primary" : "btn-secondary"
                }`}
              >
                Coming soon
              </button>
            </div>
          ))}
        </div>

        <div className="card mt-8 p-6 text-center">
          <h3 className="font-semibold text-slate-900">Or pay-as-you-go</h3>
          <p className="mt-1 text-sm text-slate-600">
            1–2% fee only on invoices you mark as paid. No monthly commitment. Ideal for seasonal sellers.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Demo app — data stays in your browser. Production billing & cloud storage coming later.
        </p>
      </main>
    </div>
  );
}

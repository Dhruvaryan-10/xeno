"use client";

import { useEffect, useState } from "react";
import { api, type Customer } from "@/lib/api";
import { channelNames, count, daysSince, inr } from "@/lib/campaign";

export function CustomersView({ active }: { active: boolean }) {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active || customers) return;
    api
      .customers(100)
      .then(setCustomers)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Couldn’t load customers."));
  }, [active, customers]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Customers</h1>
      <p className="mt-1 text-muted">Your 100 highest-spending customers.</p>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {!customers && !error ? <p className="mt-6 text-muted">Loading customers…</p> : null}
      {customers ? (
        <div className="mt-6 overflow-x-auto rounded-cell bg-surface">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b">
                <th className="py-3 pl-4 pr-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">City</th>
                <th className="px-3 py-3 text-right font-medium">Age</th>
                <th className="px-3 py-3 font-medium">Prefers</th>
                <th className="px-3 py-3 text-right font-medium">Lifetime spend</th>
                <th className="py-3 pl-3 pr-4 text-right font-medium">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((customer) => {
                const days = daysSince(customer.lastPurchaseDate);
                return (
                  <tr key={customer.id} className="hover:bg-ink/[0.02]">
                    <td className="py-3 pl-4 pr-3">
                      <span className="block text-base font-semibold">{customer.name}</span>
                      <span className="block text-xs text-muted">{customer.email}</span>
                    </td>
                    <td className="px-3 py-3">{customer.city}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{customer.age}</td>
                    <td className="px-3 py-3">{channelNames[customer.preferredChannel]}</td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{inr(customer.totalSpend)}</td>
                    <td className="py-3 pl-3 pr-4 text-right tabular-nums text-muted">{days === null ? "Never" : days === 0 ? "Today" : `${count(days)} days ago`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

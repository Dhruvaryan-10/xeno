import { faker } from "@faker-js/faker";
import type { Channel, Customer, Filters } from "@/lib/api";

const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"];
export const CHANNELS: Channel[] = ["WHATSAPP", "SMS", "EMAIL", "RCS"];

let cache: { day: string; customers: Customer[] } | null = null;

/**
 * 1,000 demo customers with 5,000 orders, generated from a fixed seed so every server instance
 * produces the same people and IDs without a database. Purchase dates are relative to today (UTC),
 * so "inactive for 60 days" keeps meaning something.
 */
export function allCustomers(): Customer[] {
  const day = new Date().toISOString().slice(0, 10);
  if (cache?.day === day) return cache.customers;

  faker.seed(20260614);
  const refDate = new Date(`${day}T00:00:00Z`);
  const customers: Customer[] = Array.from({ length: 1000 }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    phone: `+91 ${faker.string.numeric(5)} ${faker.string.numeric(5)}`,
    city: faker.helpers.arrayElement(CITIES),
    age: faker.number.int({ min: 18, max: 72 }),
    preferredChannel: faker.helpers.arrayElement(CHANNELS),
    totalSpend: 0,
    lastPurchaseDate: null
  }));

  for (let index = 0; index < 5000; index += 1) {
    const customer = faker.helpers.arrayElement(customers);
    const amount = faker.number.float({ min: 199, max: 24999, fractionDigits: 2 });
    const orderDate = faker.date.recent({ days: 365, refDate }).toISOString();
    customer.totalSpend = Number((customer.totalSpend + amount).toFixed(2));
    if (!customer.lastPurchaseDate || orderDate > customer.lastPurchaseDate) customer.lastPurchaseDate = orderDate;
  }

  customers.sort((a, b) => b.totalSpend - a.totalSpend);
  cache = { day, customers };
  return customers;
}

export function customerById(id: string) {
  return allCustomers().find((customer) => customer.id === id);
}

export function matchesFilters(customer: Customer, filters: Filters, now = Date.now()) {
  if (filters.minSpend !== undefined && customer.totalSpend < filters.minSpend) return false;
  if (filters.maxSpend !== undefined && customer.totalSpend > filters.maxSpend) return false;
  if (filters.city && customer.city.toLowerCase() !== filters.city.toLowerCase()) return false;
  if (filters.minAge !== undefined && customer.age < filters.minAge) return false;
  if (filters.maxAge !== undefined && customer.age > filters.maxAge) return false;
  if (filters.preferredChannel && customer.preferredChannel !== filters.preferredChannel) return false;
  if (filters.inactiveDays !== undefined && customer.lastPurchaseDate) {
    const cutoff = now - filters.inactiveDays * 86_400_000;
    if (new Date(customer.lastPurchaseDate).getTime() >= cutoff) return false;
  }
  return true;
}

/** Customers matching the filters, highest spend first. */
export function findCustomers(filters: Filters) {
  return allCustomers().filter((customer) => matchesFilters(customer, filters));
}

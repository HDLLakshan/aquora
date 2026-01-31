import { formatISO, parseISO } from "date-fns";

export function toIsoDateTime(date: Date): string {
  return formatISO(date);
}

export function fromIsoDateTime(value: string): Date {
  return parseISO(value);
}


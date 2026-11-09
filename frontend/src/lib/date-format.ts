import { format, isValid, parseISO } from "date-fns";

export function formatDisplayDate(value: string | Date, fallback: string): string {
  const date = typeof value === "string" ? parseISO(value) : value;

  return isValid(date) ? format(date, "d MMM yyyy") : fallback;
}

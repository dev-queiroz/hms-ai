import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para combinar e mesclar classes Tailwind CSS condicionalmente.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

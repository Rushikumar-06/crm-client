import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  // Optionally, fallback for SSR or testing
  return process.env.NEXT_PUBLIC_BACKEND_URL;
}

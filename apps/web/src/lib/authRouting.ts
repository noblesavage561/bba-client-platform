import { ROUTES } from "@/lib/routes";

const INTERNAL_PATH_PATTERN = /^\/(?!\/)/;

export function normalizeCallbackPath(
  raw: string | null | undefined,
  fallback: string = ROUTES.PORTAL
): string {
  if (!raw) {
    return fallback;
  }

  let candidate = raw;
  try {
    candidate = decodeURIComponent(raw);
  } catch {
    return fallback;
  }

  candidate = candidate.trim();
  if (!INTERNAL_PATH_PATTERN.test(candidate)) {
    return fallback;
  }

  return candidate;
}

export function buildLoginHref(callbackPath: string): string {
  const safePath = normalizeCallbackPath(callbackPath, ROUTES.PORTAL);
  return `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(safePath)}`;
}

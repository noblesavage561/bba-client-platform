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

export function buildRegisterHref(
  callbackPath: string,
  options?: { email?: string; businessName?: string; fromIntake?: boolean }
): string {
  const safePath = normalizeCallbackPath(callbackPath, ROUTES.PORTAL);
  const params = new URLSearchParams({ callbackUrl: safePath });

  if (options?.email) {
    params.set("email", options.email);
  }

  if (options?.businessName) {
    params.set("businessName", options.businessName);
  }

  if (options?.fromIntake) {
    params.set("fromIntake", "1");
  }

  return `${ROUTES.REGISTER}?${params.toString()}`;
}

export function normalizeAuthRedirectUrl(
  raw: string | null | undefined,
  fallback: string = ROUTES.PORTAL
): string {
  if (!raw) {
    return normalizeCallbackPath(fallback, ROUTES.PORTAL);
  }

  const candidate = raw.trim();
  if (INTERNAL_PATH_PATTERN.test(candidate)) {
    return normalizeCallbackPath(candidate, fallback);
  }

  try {
    const parsed = new URL(candidate);
    return normalizeCallbackPath(`${parsed.pathname}${parsed.search}${parsed.hash}`, fallback);
  } catch {
    return normalizeCallbackPath(fallback, ROUTES.PORTAL);
  }
}

export function logAuthRouteFailure(
  context: string,
  details: Record<string, unknown>
) {
  console.warn(`[AUTH_ROUTE_FAILURE] ${context}`, details);
}

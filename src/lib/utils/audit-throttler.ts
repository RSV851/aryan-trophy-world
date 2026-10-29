/**
 * Shared audit execution throttler (15-second cooldown)
 * Enforces a global 15-second minimum interval between system health audit requests
 * across manual button clicks, tab switches, and header bell notifications.
 */

let lastAuditRunTimestamp = 0;
let cachedAuditResult: any = null;
const AUDIT_COOLDOWN_MS = 15000; // 15 Seconds Cooldown

export async function runSharedHealthAudit(force = false) {
  const now = Date.now();
  const timeSinceLastRun = now - lastAuditRunTimestamp;

  // Return cached result if within 15-second cooldown and not forced
  if (!force && timeSinceLastRun < AUDIT_COOLDOWN_MS && cachedAuditResult) {
    return {
      ...cachedAuditResult,
      isCached: true,
      secondsRemaining: Math.ceil((AUDIT_COOLDOWN_MS - timeSinceLastRun) / 1000),
    };
  }

  try {
    const res = await fetch('/api/v1/admin/health-check', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      lastAuditRunTimestamp = Date.now();
      cachedAuditResult = json;
      return {
        ...json,
        isCached: false,
        secondsRemaining: 0,
      };
    }
  } catch (err) {
    if (cachedAuditResult) return cachedAuditResult;
    throw err;
  }
  return cachedAuditResult;
}

export function getTimeUntilNextAuditAllowed(): number {
  const now = Date.now();
  const timeSinceLastRun = now - lastAuditRunTimestamp;
  if (timeSinceLastRun >= AUDIT_COOLDOWN_MS) return 0;
  return Math.ceil((AUDIT_COOLDOWN_MS - timeSinceLastRun) / 1000);
}

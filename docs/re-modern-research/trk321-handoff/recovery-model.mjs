// SPDX-License-Identifier: GPL-3.0-or-later
// Read-only research model: no storage writes, no downloads, no automatic repair.
export const KEY = 'trkTitleFontWorks';
const FORMAT = 'trk-title-font-works-backup';
export const LIMIT = 256 * 1024; // Proposed backup envelope byte limit, not an existing PWA limit.

export function capture(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (raw === null) return { status: 'absent' };
    if (typeof raw !== 'string') return { status: 'unreadable' };
    return { status: 'read', raw };
  } catch { return { status: 'unreadable' }; }
}

export function makeBackup(snapshot) {
  if (snapshot.status !== 'read' || typeof snapshot.raw !== 'string') return { status: 'unavailable' };
  // JSON escaping preserves lone surrogates as well as the exact JS string.
  const text = JSON.stringify({ format: FORMAT, version: 1, key: KEY, raw: snapshot.raw });
  if (new TextEncoder().encode(text).length > LIMIT) return { status: 'too-large' };
  return { status: 'ready', text }; // Not proof the user saved a file.
}

export function inspectBackup(text) {
  if (typeof text !== 'string') return { status: 'invalid' };
  if (new TextEncoder().encode(text).length > LIMIT) return { status: 'too-large' };
  let e, value;
  try { e = JSON.parse(text); } catch { return { status: 'invalid' }; }
  if (!e || typeof e !== 'object' || Array.isArray(e) || e.format !== FORMAT || e.version !== 1 || e.key !== KEY || typeof e.raw !== 'string') return { status: 'invalid' };
  try { value = JSON.parse(e.raw); } catch { return { status: 'raw-invalid', raw: e.raw }; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { status: 'raw-invalid', raw: e.raw };
  // Shape check only: unknown entries are retained, semantics and safety not verified.
  return { status: 'object-only', raw: e.raw };
}

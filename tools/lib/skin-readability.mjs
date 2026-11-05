// SPDX-License-Identifier: GPL-3.0-or-later
// Metadata describes an intentional design; it never exempts a skin from checks.
export function validateReadability(skin) {
  const errors = [];
  const mode = skin.readability, reason = skin.readabilityReason;
  if (mode === undefined && reason === undefined) return errors;
  if (mode !== 'intentional-low') errors.push('readability は intentional-low のみ対応');
  if (!reason || typeof reason !== 'object' || Array.isArray(reason)) {
    errors.push('readabilityReason に多言語の理由が必要');
    return errors;
  }
  for (const lang of ['ja', 'en', 'zh', 'ko']) {
    if (typeof reason[lang] !== 'string' || !reason[lang].trim() || reason[lang].length > 120) errors.push(`readabilityReason.${lang} が不正`);
  }
  if (Object.keys(reason).some(k => !['ja','en','zh','ko'].includes(k))) errors.push('readabilityReason に不明な言語');
  return errors;
}

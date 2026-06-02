import type { LabeledCandidate, NamingLane } from "@/lib/types/naming";
import type { NamingCriteria } from "@/lib/intelligence/naming-criteria";
import {
  DEFAULT_COMPANION_WORDS,
  KEYWORD_ROOT_PREFIXES,
  KEYWORD_ROOT_SUFFIXES,
  SEED_COMPANION_WORDS,
  usesLiteralRoot,
} from "@/lib/intelligence/query-literalness";

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Generate root + suffix / prefix + root keyword-root labels. */
export function generateKeywordRootCandidates(
  criteria: NamingCriteria,
  lane: NamingLane = "keyword_root"
): LabeledCandidate[] {
  const policy = criteria.literalness;
  if (!usesLiteralRoot(policy) || !policy.literalRoot) return [];

  const root = policy.literalRoot.toLowerCase();
  const rootCap = capitalize(root);
  const companions =
    SEED_COMPANION_WORDS[root] ??
    DEFAULT_COMPANION_WORDS.filter((w) => w.toLowerCase() !== root);

  const results: LabeledCandidate[] = [];
  const seen = new Set<string>();

  const add = (label: string, roots?: string[]) => {
    const key = label.toLowerCase();
    if (seen.has(key) || key.length < 4 || key.length > 22) return;
    seen.add(key);
    results.push({
      label,
      lane,
      roots: roots ?? [root],
      generationPass: 1,
    });
  };

  for (const suffix of KEYWORD_ROOT_SUFFIXES) {
    if (suffix.toLowerCase() === root) continue;
    add(rootCap + suffix, [root, suffix]);
    add(suffix + rootCap, [suffix, root]);
  }

  for (const companion of companions) {
    if (companion.toLowerCase() === root) continue;
    add(rootCap + companion, [root, companion]);
    add(companion + rootCap, [companion, root]);
  }

  for (const prefix of KEYWORD_ROOT_PREFIXES) {
    add(prefix + rootCap, [prefix, root]);
  }

  add(rootCap, [root]);

  return results;
}

/** Brandable compounds anchored on literal root (business brand / saas). */
export function generateLiteralRootBrandables(
  criteria: NamingCriteria,
  lane: NamingLane = "premium_brandable"
): LabeledCandidate[] {
  const policy = criteria.literalness;
  if (!usesLiteralRoot(policy) || !policy.literalRoot) return [];

  const rootCap = capitalize(policy.literalRoot);
  const companions =
    SEED_COMPANION_WORDS[policy.literalRoot.toLowerCase()] ?? DEFAULT_COMPANION_WORDS;

  return companions
    .filter((c) => c.toLowerCase() !== policy.literalRoot!.toLowerCase())
    .map((companion) => ({
      label: rootCap + companion,
      lane,
      roots: [policy.literalRoot!, companion],
      generationPass: 1 as const,
    }));
}

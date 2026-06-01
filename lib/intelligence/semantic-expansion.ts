import type { LabeledCandidate, NamingLane } from "@/lib/types/naming";

export type SemanticRole =
  | "protection"
  | "place"
  | "alert"
  | "tech"
  | "trust"
  | "monitoring"
  | "local";

export type ExtractedConcepts = {
  roles: SemanticRole[];
  categoryKeywords: string[];
  tones: string[];
};

export type ExpandedVocabulary = Record<SemanticRole, string[]>;

export type RoleTemplate = {
  id: string;
  lane: NamingLane;
  leftRole: SemanticRole;
  rightRole: SemanticRole;
  /** Capitalize and join left + right token. */
  combine: (left: string, right: string) => string;
};

const STOP = new Set([
  "a", "an", "the", "for", "and", "or", "of", "to", "in", "at", "on", "with", "by",
  "company", "business", "brand", "store", "service", "services", "system", "systems",
]);

export const ROLE_BUCKETS: ExpandedVocabulary = {
  protection: ["Guard", "Shield", "Sentry", "Sentinel", "Fortress", "Lock", "Alert", "Secure"],
  place: ["Nest", "Haven", "Dwelling", "Home", "House"],
  alert: ["Watch", "Alert", "Signal", "Pilot"],
  tech: ["Grid", "Flow", "Loop", "Stack", "Port", "Sync"],
  trust: ["Secure", "Safe", "Trusted", "Solid", "Trust"],
  monitoring: ["Watch", "Monitor", "Scan", "Sense", "View"],
  local: ["Co", "Pros", "Group", "Team", "Works"],
};

const CONCEPT_TRIGGERS: { role: SemanticRole; pattern: RegExp }[] = [
  { role: "protection", pattern: /security|secure|guard|shield|alarm|surveillance|protect/i },
  { role: "place", pattern: /home|house|nest|haven|dwelling|domestic|residential/i },
  { role: "alert", pattern: /alert|watch|monitor|signal|detect/i },
  { role: "tech", pattern: /system|tech|smart|digital|app|platform|grid|automation/i },
  { role: "trust", pattern: /trust|safe|reliable|secure|protect/i },
  { role: "monitoring", pattern: /monitor|surveillance|cctv|camera|sensor/i },
  { role: "local", pattern: /local|city|region|near|area/i },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s,-]/g, " ")
    .split(/[\s,_-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** Detect semantic roles and category keywords from a brief corpus string. */
export function extractConcepts(corpus: string): ExtractedConcepts {
  const roles = new Set<SemanticRole>();
  for (const { role, pattern } of CONCEPT_TRIGGERS) {
    if (pattern.test(corpus)) roles.add(role);
  }
  if (/home\s*security|security\s*system|alarm|surveillance/i.test(corpus)) {
    roles.add("protection");
    roles.add("place");
    roles.add("alert");
    roles.add("monitoring");
    roles.add("trust");
  }
  if (roles.size === 0) {
    roles.add("protection");
    roles.add("place");
  }
  return {
    roles: [...roles],
    categoryKeywords: tokenize(corpus),
    tones: [],
  };
}

/** Expand detected roles into capitalized vocabulary tokens (not query joins). */
export function expandVocabulary(concepts: ExtractedConcepts): ExpandedVocabulary {
  const vocab: ExpandedVocabulary = {
    protection: [],
    place: [],
    alert: [],
    tech: [],
    trust: [],
    monitoring: [],
    local: [],
  };
  for (const role of concepts.roles) {
    vocab[role] = [...ROLE_BUCKETS[role]];
  }
  if (concepts.roles.includes("protection") || concepts.roles.includes("monitoring")) {
    vocab.tech = [...new Set([...vocab.tech, ...ROLE_BUCKETS.tech])];
    vocab.alert = [...new Set([...vocab.alert, ...ROLE_BUCKETS.alert])];
  }
  return vocab;
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: "protector_place",
    lane: "premium_brandable",
    leftRole: "protection",
    rightRole: "place",
    combine: (l, r) => capitalize(l) + capitalize(r),
  },
  {
    id: "place_protector",
    lane: "service_clear",
    leftRole: "place",
    rightRole: "protection",
    combine: (l, r) => capitalize(l) + capitalize(r),
  },
  {
    id: "alert_tech",
    lane: "saas_app",
    leftRole: "alert",
    rightRole: "tech",
    combine: (l, r) => capitalize(l) + capitalize(r),
  },
  {
    id: "protector_tech",
    lane: "saas_app",
    leftRole: "protection",
    rightRole: "tech",
    combine: (l, r) => capitalize(l) + capitalize(r),
  },
  {
    id: "trust_place",
    lane: "premium_brandable",
    leftRole: "trust",
    rightRole: "place",
    combine: (l, r) => capitalize(l) + capitalize(r),
  },
];

/** Role template definitions for documentation and lane wiring. */
export function buildCompoundTemplates(vocab: ExpandedVocabulary): RoleTemplate[] {
  return ROLE_TEMPLATES.filter(
    (t) => vocab[t.leftRole].length > 0 && vocab[t.rightRole].length > 0
  );
}

/** Generate labeled candidates from role templates — concept-first, not query joins. */
export function generateRoleTemplateCandidates(
  corpus: string,
  options?: { maxPerTemplate?: number; lane?: NamingLane }
): LabeledCandidate[] {
  const concepts = extractConcepts(corpus);
  const vocab = expandVocabulary(concepts);
  const templates = buildCompoundTemplates(vocab);
  const maxPer = options?.maxPerTemplate ?? 12;
  const results: LabeledCandidate[] = [];
  const seen = new Set<string>();

  for (const template of templates) {
    if (options?.lane && template.lane !== options.lane) continue;
    const leftTokens = vocab[template.leftRole].slice(0, maxPer);
    const rightTokens = vocab[template.rightRole].slice(0, maxPer);
    for (const left of leftTokens) {
      for (const right of rightTokens) {
        if (left.toLowerCase() === right.toLowerCase()) continue;
        const label = template.combine(left, right);
        const key = label.toLowerCase();
        if (seen.has(key) || label.length < 4 || label.length > 22) continue;
        seen.add(key);
        results.push({
          label,
          lane: template.lane,
          roots: [left, right],
          template: template.id,
        });
      }
    }
  }

  return results;
}

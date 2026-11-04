/**
 * Plain-language description of how NameMog computes its signals.
 * Source of truth: lib/intelligence/score-domain.ts, lib/intelligence/parse-domain.ts,
 * lib/intelligence/name-rejection.ts and lib/search/brief-config.ts.
 * If the scoring code changes, update this file so the guides stay accurate.
 */

export type SignalKey =
  | "brand"
  | "marketing"
  | "search"
  | "ai"
  | "trust"
  | "resale"
  | "value";

export type SignalDescription = {
  key: SignalKey;
  label: string;
  /** What the score is built from, in plain language. */
  computedFrom: string;
  /** What the score does NOT measure. */
  limits: string;
};

export const SIGNAL_MODEL: Record<SignalKey, SignalDescription> = {
  brand: {
    key: "brand",
    label: "Brand Strength",
    computedFrom:
      "Mostly label clarity: clarity starts at 100 and loses 4 points per character past 12 characters (6 more per character past 18). Smaller weight goes to how many of your query's words appear in the name and to location fit. When your buying intent is a business brand, SaaS/app or ecommerce store, a 6–14 character compound label gets a bonus. Over-long labels and repeated short tokens are penalized.",
    limits:
      "It does not listen to the name: pronunciation, spelling ambiguity and emotional fit are not scored, so run the radio test yourself.",
  },
  marketing: {
    key: "marketing",
    label: "Marketing Clarity",
    computedFrom: "The average of Brand Strength and Search Relevance, so it rewards names that are both memorable and descriptive.",
    limits: "It inherits the limits of both inputs; it is not a survey of real customers.",
  },
  search: {
    key: "search",
    label: "Search Relevance",
    computedFrom:
      "How many meaningful words from your query appear in the label (largest share), whether your location is included, whether the words appear in your order, and label clarity. .com gets +5 and .net +2. For brand-style intents, a name that is just your whole query glued together is marked down, because those read as keyword slugs rather than brands.",
    limits:
      "It compares the name to the words you typed. It does not look up search volume, backlinks, domain history or rankings.",
  },
  ai: {
    key: "ai",
    label: "AI/Entity Clarity",
    computedFrom:
      "Label clarity (largest share), keyword coverage, location coverage and word order, with a small bonus for hyphens because they make word boundaries explicit to parsers. Length and redundancy penalties apply.",
    limits:
      "It estimates how easily the name parses into a clear entity. It does not check whether any AI assistant actually mentions or recommends you.",
  },
  trust: {
    key: "trust",
    label: "Trust",
    computedFrom:
      "Set by the extension: .com 100, .net 85, .org 80, .io 75, .co 70, .app 65, .dev 60, .tech 55, other extensions 45. Hyphenated labels lose 3 points.",
    limits: "It reflects buyer familiarity with the extension, not the reputation of the domain or its past owner.",
  },
  resale: {
    key: "resale",
    label: "Resale Potential",
    computedFrom:
      "Half the extension's trust score, plus 15 for labels of 10 characters or fewer (5 for 11–14, minus 5 beyond that), plus 15 for .com.",
    limits: "It is a structural heuristic, not an appraisal based on comparable sales.",
  },
  value: {
    key: "value",
    label: "Value",
    computedFrom:
      "The average of Brand Strength, Search Relevance, AI/Entity Clarity and Marketing Clarity, minus a price penalty of 1 point per $20 (capped at 25 points).",
    limits: "It only knows the listed price, not what the name is worth to your business.",
  },
};

export const OVERALL_SCORE_NOTE =
  "The overall score is a weighted average of Brand, Search, AI, Value, Trust and Resale using the weights for your buying intent (you can adjust them), minus a small risk penalty. Risk rises with weaker extensions, hyphens, labels over 14 characters and non-.com endings.";

export const BUSINESS_BRAND_WEIGHTS: { label: string; weight: number }[] = [
  { label: "Brand", weight: 2.5 },
  { label: "Trust", weight: 2 },
  { label: "AI visibility", weight: 1.2 },
  { label: "SEO", weight: 1 },
  { label: "Value", weight: 1 },
  { label: "Resale", weight: 0.5 },
];

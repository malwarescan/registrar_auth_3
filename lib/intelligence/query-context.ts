const STOP_WORDS = new Set([
  "in", "the", "a", "an", "for", "and", "or", "of", "to", "at", "on", "with", "by", "my",
]);

/** Meta words that signal local intent but are not business names. */
const LOCAL_META_WORDS = new Set([
  "local", "near", "me", "company", "business", "service", "services",
]);

/** Generic venue words — detect local intent but don't become domain tokens alone. */
const GENERIC_VENUE_WORDS = new Set([
  "restaurant", "restaurants", "shop", "store", "office", "studio",
]);

/** Specific service/product nouns — keep as business tokens (pizza, salon, etc.). */
const SERVICE_NOUNS = new Set([
  "pizza", "pizzeria", "parlour", "parlor", "cafe", "coffee", "bar", "bakery", "bistro",
  "salon", "spa", "clinic", "gym", "plumber", "plumbing", "roofing", "landscaping", "hvac",
  "dentist", "lawyer", "attorney", "pasta", "taco", "sushi", "grill", "bbq", "brewery",
  "florist", "cleaning", "electric", "electrician", "mechanic", "auto", "towing",
]);

const US_STATE_ABBREVS = new Set([
  "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga", "hi", "id", "il", "in", "ia",
  "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj",
  "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt",
  "va", "wa", "wv", "wi", "wy", "dc",
]);

const LOCATION_ABBREVS: Array<[RegExp, string]> = [
  [/los\s+angeles/g, "la"],
  [/new\s+york/g, "ny"],
  [/san\s+francisco/g, "sf"],
  [/san\s+diego/g, "sd"],
  [/pasadena/g, "pasadena"],
];

export type QueryContext = {
  raw: string;
  allTokens: string[];
  businessTokens: string[];
  locationTokens: string[];
  isLocalIntent: boolean;
};

/** Parse query into business vs location tokens and detect local-service intent. */
export function analyzeQueryContext(query: string): QueryContext {
  const raw = query.trim();
  let text = raw.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");

  for (const [pattern, abbrev] of LOCATION_ABBREVS) {
    text = text.replace(pattern, ` ${abbrev} `);
  }

  const hasLocalIntentWord = [...GENERIC_VENUE_WORDS, ...SERVICE_NOUNS, ...LOCAL_META_WORDS].some((w) =>
    new RegExp(`\\b${w}\\b`, "i").test(raw)
  );

  // Explicit "in [place]" — strongest local signal
  const inPlaceMatch = raw.match(/\bin\s+([a-z][a-z\s-]{2,})/i);
  let locationTokens: string[] = [];
  if (inPlaceMatch) {
    locationTokens = inPlaceMatch[1]
      .trim()
      .toLowerCase()
      .split(/[\s,_-]+/)
      .filter(
        (t) =>
          !STOP_WORDS.has(t) &&
          (t.length > 2 || US_STATE_ABBREVS.has(t))
      );
  }

  const allTokens = text
    .split(/[\s,_-]+/)
    .map((t) => t.trim())
    .filter(
      (t) =>
        t.length > 1 &&
        !STOP_WORDS.has(t) &&
        !LOCAL_META_WORDS.has(t) &&
        !GENERIC_VENUE_WORDS.has(t) &&
        !US_STATE_ABBREVS.has(t)
    );

  const locationSet = new Set(locationTokens);
  const businessTokens = [...new Set(allTokens.filter((t) => !locationSet.has(t)))];

  if (locationTokens.length === 0) {
    // Heuristic: trailing token that looks like a city (long, not a common product word)
    const last = businessTokens[businessTokens.length - 1];
    if (last && last.length >= 6 && businessTokens.length >= 2) {
      locationTokens = [last];
      businessTokens.pop();
    }
  }

  const isLocalIntent =
    locationTokens.length > 0 && (hasLocalIntentWord || /\bin\s+/i.test(raw));

  return {
    raw,
    allTokens: [...new Set(allTokens)],
    businessTokens,
    locationTokens: [...new Set(locationTokens)],
    isLocalIntent,
  };
}

export function labelIncludesLocation(label: string, locationTokens: string[]): boolean {
  const normalized = label.toLowerCase().replace(/-/g, "");
  return locationTokens.some((t) => normalized.includes(t.replace(/-/g, "")));
}

/** Tokens that actually matter for fit scoring — skip venue filler and state abbrevs. */
const SCORING_NOISE = new Set([
  "parlour", "parlor", "restaurant", "restaurants", "local", "near", "company", "business",
  "service", "services", "shop", "store", "office", "studio",
]);

export function getMeaningfulScoringTokens(
  context: QueryContext,
  primaryService?: string
): string[] {
  const business = context.businessTokens.filter(
    (t) => !SCORING_NOISE.has(t) && !US_STATE_ABBREVS.has(t)
  );
  const locations = context.locationTokens.filter((t) => !US_STATE_ABBREVS.has(t));

  const tokens: string[] = [];
  if (primaryService && !SCORING_NOISE.has(primaryService)) {
    tokens.push(primaryService.toLowerCase());
  }
  for (const t of business) {
    if (!tokens.includes(t)) tokens.push(t);
  }
  for (const t of locations) {
    if (!tokens.includes(t)) tokens.push(t);
  }
  return tokens.slice(0, 4);
}

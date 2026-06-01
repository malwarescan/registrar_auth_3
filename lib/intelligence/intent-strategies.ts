import type { BuyingIntent } from "@/lib/types/domain-brief";
import type { NamingCriteria, NicheCategory } from "@/lib/intelligence/naming-criteria";

export type LabelGenerator = (criteria: NamingCriteria) => string[];

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function addLabel(
  labels: Set<string>,
  label: string,
  constraints?: NamingCriteria["constraints"]
) {
  const clean = label.replace(/[^a-zA-Z0-9-]/g, "");
  const maxLen = constraints?.maxLabelLength ?? 22;
  if (clean.length < 4 || clean.length > maxLen || /^\d/.test(clean)) return;
  if (!constraints?.allowHyphens && clean.includes("-")) return;
  if (!constraints?.allowNumbers && /\d/.test(clean)) return;
  labels.add(clean);
}

function withHyphen(a: string, b: string, c: NamingCriteria): string {
  return c.constraints.allowHyphens ? `${a}-${b}` : "";
}

/** Niche-specific brandable roots for local businesses. */
const NICHE_BRAND_ROOTS: Record<NicheCategory, Record<string, string[]>> = {
  food: {
    pizza: ["Slice", "Pie", "Oven", "Crust", "Fire"],
    pizzeria: ["Slice", "Pie", "Oven"],
    cafe: ["Bean", "Brew", "Cup", "Roast"],
    coffee: ["Bean", "Brew", "Roast", "Cup"],
    bakery: ["Crumb", "Rise", "Flour", "Sweet"],
    sushi: ["Roll", "Fish", "Zen"],
    taco: ["Taco", "Fiesta", "Loco"],
    default: ["Kitchen", "Eats", "Table", "Taste"],
  },
  home_services: {
    landscaping: ["Green", "Lawn", "Terra", "Bloom", "Root"],
    lawn: ["Green", "Lawn", "Turf", "Blade"],
    plumbing: ["Flow", "Pipe", "Aqua", "Clear"],
    roofing: ["Peak", "Shield", "Top", "Cover"],
    hvac: ["Cool", "Air", "Comfort", "Climate"],
    cleaning: ["Spark", "Fresh", "Pure", "Shine"],
    default: ["Pro", "Care", "Fix", "Works"],
  },
  professional: {
    lawyer: ["Legal", "Counsel", "Lex", "Trust"],
    attorney: ["Legal", "Counsel", "Lex"],
    realty: ["Key", "Nest", "Door", "Home"],
    default: ["Group", "Partners", "Advisors", "Co"],
  },
  health: {
    dentist: ["Smile", "Dental", "Bright", "Pearl"],
    salon: ["Glow", "Style", "Shear", "Luxe"],
    spa: ["Glow", "Pure", "Calm", "Zen"],
    gym: ["Fit", "Peak", "Strong", "Flex"],
    default: ["Care", "Well", "Vital", "Life"],
  },
  retail: {
    default: ["Shop", "Market", "Goods", "Supply"],
  },
  tech: {
    default: ["Lab", "Stack", "Core", "Flow", "Grid"],
  },
  general: {
    default: ["Pro", "Co", "Hub", "Works"],
  },
};

const LOCAL_TRUST_SUFFIXES = ["Co", "Pros", "Group", "Team", "HQ"];
const PREMIUM_PREFIXES = ["Premier", "Elite", "Prime", "Royal"];
const FRIENDLY_SUFFIXES = ["Spot", "Place", "Hub", "Corner"];

function getNicheRoots(criteria: NamingCriteria): string[] {
  const cat = NICHE_BRAND_ROOTS[criteria.nicheCategory] ?? NICHE_BRAND_ROOTS.general;
  const service = criteria.service.toLowerCase();
  return cat[service] ?? cat.default ?? ["Pro"];
}

function isPremiumTone(criteria: NamingCriteria): boolean {
  return criteria.tones.some((t) => ["Premium", "Luxury", "Corporate"].includes(t));
}

function isFriendlyTone(criteria: NamingCriteria): boolean {
  return criteria.tones.some((t) => ["Friendly", "Playful", "Local"].includes(t));
}

/** Local service: service + city SEO patterns + niche brandables. */
function generateLocalService(criteria: NamingCriteria): string[] {
  const labels = new Set<string>();
  const city = criteria.locationCity;
  const region = criteria.locationRegion;
  const service = criteria.service;

  if (!city || !service) {
    return generateFallbackFromDescription(criteria);
  }

  const cityCap = capitalize(city);
  const serviceCap = capitalize(service);
  const roots = getNicheRoots(criteria);

  // Tier 1: Names a real local business would use (PasadenaPizzaCo, SlicePasadena)
  for (const suffix of LOCAL_TRUST_SUFFIXES.slice(0, 3)) {
    addLabel(labels, cityCap + serviceCap + suffix, criteria.constraints);
  }
  for (const root of roots.slice(0, 5)) {
    addLabel(labels, root + cityCap, criteria.constraints);
    addLabel(labels, cityCap + root, criteria.constraints);
    if (service === "pizza" || service === "pizzeria") {
      addLabel(labels, cityCap + "Slice", criteria.constraints);
      addLabel(labels, "Slice" + cityCap, criteria.constraints);
      addLabel(labels, cityCap + "Pie", criteria.constraints);
    }
  }

  // Tier 2: Readable hyphenated local names
  const hyphen1 = withHyphen(city, service, criteria);
  const hyphen2 = withHyphen(service, city, criteria);
  if (hyphen1) addLabel(labels, hyphen1, criteria.constraints);
  if (hyphen2) addLabel(labels, hyphen2, criteria.constraints);

  // Tier 3: Raw keyword slugs only when user asks for local SEO / exact match
  if (criteria.constraints.preferKeywordSlug) {
    addLabel(labels, service + city, criteria.constraints);
    addLabel(labels, city + service, criteria.constraints);
  }

  // Tier 4: Premium / friendly tone variants
  if (isPremiumTone(criteria)) {
    for (const prefix of PREMIUM_PREFIXES.slice(0, 2)) {
      addLabel(labels, prefix + cityCap + serviceCap, criteria.constraints);
    }
  }
  if (isFriendlyTone(criteria)) {
    for (const suffix of FRIENDLY_SUFFIXES.slice(0, 2)) {
      addLabel(labels, cityCap + serviceCap + suffix, criteria.constraints);
    }
  }

  // Tier 5: Region qualifier when different from city (skip state abbreviations like CA, TX)
  if (
    region &&
    region !== city &&
    region.length <= 12 &&
    !/^[a-z]{2}$/i.test(region)
  ) {
    const regionShort = region.length > 6 ? region.slice(0, 4) : region;
    addLabel(labels, service + city + capitalize(regionShort), criteria.constraints);
  }

  return filterLocalLabels([...labels], criteria);
}

function filterLocalLabels(labels: string[], criteria: NamingCriteria): string[] {
  const { locationKeywords, serviceKeywords, service } = criteria;
  const primaryService = service.toLowerCase();

  return labels.filter((label) => {
    const norm = label.toLowerCase().replace(/-/g, "");
    const isBareGeo = locationKeywords.some((t) => norm === t.replace(/-/g, ""));
    if (isBareGeo) return false;

    const hasService =
      norm.includes(primaryService) ||
      serviceKeywords.some((t) => norm.includes(t) && t !== "parlour" && t !== "parlor");
    const hasLocation = locationKeywords.some((t) => norm.includes(t.replace(/-/g, "")));

    if (hasLocation && hasService) return true;
    if (hasService && !hasLocation) return true;
    if (hasLocation && !hasService && norm.length > 12) return true;
    return false;
  });
}

function generateFallbackFromDescription(criteria: NamingCriteria): string[] {
  const tokens = criteria.description
    .toLowerCase()
    .split(/[\s,_-]+/)
    .filter((t) => t.length > 3);
  const labels = new Set<string>();
  if (tokens.length >= 2) {
    addLabel(labels, tokens[0] + tokens[1], criteria.constraints);
  }
  return [...labels];
}

/** Business brand: compound brandables from semantic roots — no literal query joins. */
const SEMANTIC_ROOTS: Record<string, string[]> = {
  security: ["Guard", "Shield", "Secure", "Safe", "Sentry", "Fortress", "Alert", "Watch", "Lock", "Trust"],
  home: ["Home", "Nest", "Haven", "House"],
  smart: ["Smart", "Pulse", "Sync", "Link", "Hub"],
  eco: ["Eco", "Green", "Leaf", "Pure", "Terra"],
  energy: ["Volt", "Power", "Grid", "Spark", "Flux"],
  ai: ["Mind", "Logic", "Brain", "Pilot", "Flow", "Grid", "Signal"],
  tech: ["Tech", "Lab", "Stack", "Core", "Byte", "Node"],
  health: ["Vital", "Care", "Well", "Life", "Med"],
  finance: ["Capital", "Fund", "Vault", "Trust", "Ledger"],
  pizza: ["Slice", "Pie", "Oven", "Crust", "Fire"],
  pizzeria: ["Slice", "Pie", "Oven", "Crust"],
  food: ["Kitchen", "Taste", "Table", "Craft", "Bistro"],
  coffee: ["Bean", "Brew", "Roast", "Cup"],
  cafe: ["Bean", "Brew", "Cup"],
  landscaping: ["Green", "Lawn", "Terra", "Bloom", "Root"],
  plumbing: ["Flow", "Pipe", "Aqua", "Clear"],
  dental: ["Smile", "Bright", "Pearl"],
  legal: ["Counsel", "Lex", "Trust"],
};

const GENERIC_BRAND_FALLBACK = ["Nova", "Prime", "Core", "Peak"];

const BRAND_SUFFIXES = [
  "Nest", "Haven", "Guard", "Shield", "Pilot", "Flow", "Grid", "Signal",
  "HQ", "Home", "Loop", "Pulse", "Core", "Lab", "Hub", "Works", "Pro",
];

function extractBrandRoots(criteria: NamingCriteria): string[] {
  const corpus = [criteria.description, criteria.industry].join(" ").toLowerCase();
  const roots = new Set<string>();

  for (const [keyword, brandRoots] of Object.entries(SEMANTIC_ROOTS)) {
    if (corpus.includes(keyword)) {
      for (const r of brandRoots) roots.add(r);
    }
  }

  if (/home\s*security|security\s*system|alarm|surveillance/i.test(corpus)) {
    for (const name of [
      "GuardNest", "HavenGuard", "SecureHaven", "ShieldNest", "HomeSentry",
      "AlertPilot", "WatchGrid", "SentryLoop", "GuardFlow", "SafeHaven",
    ]) {
      roots.add(name);
    }
  }

  return [...roots];
}

/** Brand names anchored to the user's actual business — never generic when subject is known. */
function generateSubjectAnchoredBrand(criteria: NamingCriteria): string[] {
  const labels = new Set<string>();
  const service = criteria.service;
  const serviceCap = service ? capitalize(service) : "";
  const roots = getNicheRoots(criteria);
  const city = criteria.locationCity;
  const cityCap = city ? capitalize(city) : "";

  for (let i = 0; i < roots.length; i++) {
    for (let j = 0; j < roots.length; j++) {
      if (i === j) continue;
      addLabel(labels, roots[i] + roots[j], criteria.constraints);
    }
    for (const suffix of ["Works", "Co", "House", "Craft"]) {
      addLabel(labels, roots[i] + suffix, criteria.constraints);
    }
  }

  if (serviceCap) {
    for (const root of roots.slice(0, 6)) {
      addLabel(labels, serviceCap + root, criteria.constraints);
      addLabel(labels, root + serviceCap, criteria.constraints);
    }
    for (const suffix of BRAND_SUFFIXES.slice(0, 10)) {
      if (serviceCap.toLowerCase() !== suffix.toLowerCase()) {
        addLabel(labels, serviceCap + suffix, criteria.constraints);
      }
    }
  }

  if (cityCap && serviceCap) {
    for (const root of roots.slice(0, 5)) {
      addLabel(labels, root + cityCap, criteria.constraints);
      addLabel(labels, cityCap + root, criteria.constraints);
    }
    addLabel(labels, serviceCap + cityCap, criteria.constraints);
    addLabel(labels, cityCap + serviceCap, criteria.constraints);
    addLabel(labels, cityCap + serviceCap + "Co", criteria.constraints);
  } else if (cityCap && roots.length > 0) {
    for (const root of roots.slice(0, 4)) {
      addLabel(labels, root + cityCap, criteria.constraints);
      addLabel(labels, cityCap + root, criteria.constraints);
    }
  }

  return [...labels];
}

function addSemanticCompounds(criteria: NamingCriteria, labels: Set<string>, roots: string[]) {
  for (const r of roots) {
    if (r.length >= 8 && r.length <= 16) addLabel(labels, r, criteria.constraints);
    for (const s of BRAND_SUFFIXES) {
      if (r.toLowerCase() !== s.toLowerCase()) {
        addLabel(labels, r + s, criteria.constraints);
        addLabel(labels, s + r, criteria.constraints);
      }
    }
  }

  for (let i = 0; i < Math.min(roots.length, 6); i++) {
    for (let j = 0; j < Math.min(roots.length, 6); j++) {
      if (i === j) continue;
      addLabel(labels, roots[i] + roots[j], criteria.constraints);
    }
  }
}

function generateBusinessBrand(criteria: NamingCriteria): string[] {
  const labels = new Set<string>();
  const roots = extractBrandRoots(criteria);

  // Industry-aware names first (GuardNest, ShieldHome, …)
  if (roots.length > 0) {
    addSemanticCompounds(criteria, labels, roots);
  } else if (criteria.hasSubject) {
    for (const label of generateSubjectAnchoredBrand(criteria)) {
      labels.add(label);
    }
  }

  if (labels.size === 0) {
    for (const r of GENERIC_BRAND_FALLBACK) {
      for (const s of BRAND_SUFFIXES.slice(0, 6)) {
        addLabel(labels, r + s, criteria.constraints);
      }
    }
  }

  return [...labels];
}

const TECH_SUFFIXES = ["Flow", "Loop", "Grid", "IQ", "Pulse", "Stack", "Port", "Sync", "Signal", "Pilot"];

function generateSaasApp(criteria: NamingCriteria): string[] {
  const labels = new Set<string>();
  const roots = extractBrandRoots(criteria);

  if (criteria.hasSubject) {
    for (const label of generateSubjectAnchoredBrand(criteria)) {
      labels.add(label);
    }
  }

  const techRoots = roots.length > 0 ? roots : getNicheRoots(criteria);
  if (techRoots.length > 0) {
    for (const r of techRoots.slice(0, 8)) {
      for (const s of TECH_SUFFIXES) {
        if (r.toLowerCase() !== s.toLowerCase()) addLabel(labels, r + s, criteria.constraints);
      }
      addLabel(labels, r, criteria.constraints);
    }
  }

  if (labels.size === 0) {
    for (const r of ["Nova", "Pulse", "Grid", "Flow"]) {
      for (const s of TECH_SUFFIXES.slice(0, 5)) addLabel(labels, r + s, criteria.constraints);
    }
  }

  return [...labels];
}

const SEO_SUFFIXES = ["Guide", "Reviews", "Hub", "Insider", "Daily", "Central", "Expert", "Tips"];
const SEO_PREFIXES = ["Best", "Smart", "Top", "Ultimate", "Pro"];

function generateSeoContent(criteria: NamingCriteria): string[] {
  const labels = new Set<string>();
  const tokens = [
    ...criteria.serviceKeywords,
    ...tokenize(criteria.description),
    ...tokenize(criteria.industry),
  ].filter((t, i, a) => a.indexOf(t) === i);

  if (tokens.length === 0) return [];

  const joined = tokens.slice(0, 4).join("");
  const hyphenated = tokens.slice(0, 4).join("-");
  addLabel(labels, joined, { ...criteria.constraints, allowHyphens: true });
  addLabel(labels, hyphenated, { ...criteria.constraints, allowHyphens: true });

  for (const prefix of SEO_PREFIXES) {
    addLabel(labels, prefix + capitalize(tokens[0]) + tokens.slice(1).map(capitalize).join(""), criteria.constraints);
  }
  for (const suffix of SEO_SUFFIXES) {
    addLabel(labels, capitalize(tokens[0]) + suffix, criteria.constraints);
    addLabel(labels, joined + suffix, criteria.constraints);
  }

  return [...labels];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s,_-]+/)
    .filter((t) => t.length > 2);
}

function generatePersonalBrand(criteria: NamingCriteria): string[] {
  const labels = new Set<string>();
  const nameParts = tokenize(criteria.personalName || criteria.description);
  if (nameParts.length === 0) return [];

  const first = capitalize(nameParts[0]);
  const last = nameParts.length > 1 ? capitalize(nameParts[nameParts.length - 1]) : "";

  if (last) {
    addLabel(labels, first + last, criteria.constraints);
    if (criteria.constraints.allowHyphens) addLabel(labels, `${first}-${last}`, criteria.constraints);
  }
  addLabel(labels, first, criteria.constraints);

  const profession = tokenize(criteria.profession)[0];
  if (profession) {
    const prof = capitalize(profession);
    addLabel(labels, first + prof, criteria.constraints);
    addLabel(labels, "WorkWith" + first, criteria.constraints);
    addLabel(labels, first + "HQ", criteria.constraints);
    addLabel(labels, first + "Studio", criteria.constraints);
  } else {
    addLabel(labels, first + "HQ", criteria.constraints);
    addLabel(labels, first + "Studio", criteria.constraints);
  }

  return [...labels];
}

const ECOMM_SUFFIXES = ["Shop", "Store", "Market", "Goods", "Supply", "Direct"];

function generateEcommerce(criteria: NamingCriteria): string[] {
  const brand = generateBusinessBrand(criteria);
  const labels = new Set<string>(brand);
  const product = criteria.service || criteria.serviceKeywords[0];
  if (product) {
    const p = capitalize(product);
    for (const s of ECOMM_SUFFIXES) addLabel(labels, p + s, criteria.constraints);
    addLabel(labels, p + "Direct", criteria.constraints);
  }
  return [...labels];
}

function generateCampaign(criteria: NamingCriteria): string[] {
  const labels = new Set<string>();
  const tokens = tokenize(criteria.description + " " + criteria.service);
  const base = tokens.slice(0, 2).map(capitalize).join("");
  if (base) {
    for (const s of ["Go", "Now", "HQ", "Hub", "Launch", "Live"]) {
      addLabel(labels, base + s, criteria.constraints);
      addLabel(labels, s + base, criteria.constraints);
    }
  }
  return [...labels];
}

function generateProtection(criteria: NamingCriteria): string[] {
  const labels = new Set<string>();
  const base = criteria.currentDomain.replace(/^https?:\/\//, "").split(".")[0] || "";
  if (!base) return [];
  addLabel(labels, base, criteria.constraints);
  addLabel(labels, base + "hq", criteria.constraints);
  addLabel(labels, "get" + capitalize(base), criteria.constraints);
  addLabel(labels, "my" + capitalize(base), criteria.constraints);
  return [...labels];
}

type SemanticBank = {
  core: string[];
  trust: string[];
  brandable: string[];
  market: string[];
  short: string[];
};

const SEMANTIC_BANKS: Array<{ match: RegExp; bank: SemanticBank }> = [
  {
    match: /home\s*construction|home\s*build|builder|contract|renovat|remodel/i,
    bank: {
      core: ["Build", "Builder", "Construct", "Contract", "Remodel", "Renovation", "Dwelling", "Home"],
      trust: ["Prime", "Solid", "Trusted", "Premier", "Cornerstone", "Anchor"],
      brandable: ["Haven", "Nest", "Forge", "Rise", "Pillar", "Blueprint", "Ridge", "Summit", "Terra"],
      market: ["Pros", "Network", "Hub", "Market", "Direct", "Quotes", "Leads", "Source"],
      short: ["Buildly", "Constructly", "Dwellio", "Buildora", "NestBuild", "HomeForge"],
    },
  },
  {
    match: /security|cyber|defend|protect|alarm|surveillance/i,
    bank: {
      core: ["Guard", "Secure", "Shield", "Sentry", "Watch", "Lock"],
      trust: ["Trust", "Prime", "Safe", "Fortress", "Noble"],
      brandable: ["Nest", "Haven", "Forge", "Flow", "Grid"],
      market: ["Hub", "Network", "Direct", "Pros"],
      short: ["Guardly", "Shieldio", "SafeGrid"],
    },
  },
];

const DEFAULT_INVESTMENT_BANK: SemanticBank = {
  core: ["Prime", "Core", "Build", "Home", "Trust", "Market"],
  trust: ["Prime", "Elite", "Noble", "Premier"],
  brandable: ["Haven", "Nest", "Forge", "Rise", "Pillar"],
  market: ["Hub", "Network", "Direct", "Pros", "Market", "Source"],
  short: ["Brandly", "Marketo", "Nestio"],
};

function splitLabelWords(label: string): string[] {
  return label
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function inferSemanticBank(criteria: NamingCriteria): SemanticBank {
  const corpus = `${criteria.description} ${criteria.industry} ${criteria.serviceKeywords.join(" ")}`;
  const matched = SEMANTIC_BANKS.find((entry) => entry.match.test(corpus));
  if (matched) return matched.bank;
  return DEFAULT_INVESTMENT_BANK;
}

function looksAwkwardKeywordStuffing(label: string): boolean {
  const words = splitLabelWords(label);
  if (words.length >= 4) return true;
  const normalized = label.toLowerCase();
  if (/homeconstructionhome|constructionhomebuyer|buyershomeco|buyers-home/.test(normalized)) return true;
  if (/^(co|pro|hub|works|market)(co|pro|hub|works|market)/.test(normalized)) return true;
  const unique = new Set(words);
  return unique.size !== words.length && words.length >= 2;
}

function passesLanguageQuality(label: string, criteria: NamingCriteria): boolean {
  const words = splitLabelWords(label);
  if (words.length === 0) return false;
  if (looksAwkwardKeywordStuffing(label)) return false;
  if (!criteria.constraints.allowHyphens && label.includes("-")) return false;
  if (!criteria.constraints.allowNumbers && /\d/.test(label)) return false;
  if (words.some((w) => w.length <= 1)) return false;
  if (criteria.constraints.preferBrandable && words.length > 3) return false;
  if (label.length > criteria.constraints.maxLabelLength) return false;
  return true;
}

function generateInvestment(criteria: NamingCriteria): string[] {
  const labels = new Set<string>();
  const bank = inferSemanticBank(criteria);

  // A) Premium brandable
  for (const core of bank.core.slice(0, 6)) {
    for (const brand of bank.brandable.slice(0, 6)) {
      if (core.toLowerCase() === brand.toLowerCase()) continue;
      addLabel(labels, core + brand, criteria.constraints);
      addLabel(labels, brand + core, criteria.constraints);
    }
  }

  // B) Service-clear / buyer-ready
  for (const core of bank.core.slice(0, 5)) {
    for (const m of bank.market.slice(0, 5)) {
      addLabel(labels, core + m, criteria.constraints);
    }
  }

  // C) Trust-led variants
  for (const trust of bank.trust.slice(0, 4)) {
    for (const core of bank.core.slice(0, 5)) {
      addLabel(labels, trust + core, criteria.constraints);
      addLabel(labels, core + trust, criteria.constraints);
    }
  }

  // D) Short premium variants
  for (const short of bank.short.slice(0, 6)) {
    addLabel(labels, short, criteria.constraints);
  }

  // E) Partial match only as backup (not dominant)
  const tokens = tokenize(`${criteria.description} ${criteria.industry}`).slice(0, 4);
  if (tokens.length >= 2) {
    addLabel(labels, capitalize(tokens[0]) + capitalize(tokens[1]), criteria.constraints);
    addLabel(labels, capitalize(tokens[0]) + "Direct", criteria.constraints);
    addLabel(labels, capitalize(tokens[1]) + "Hub", criteria.constraints);
  }

  return [...labels].filter((label) => passesLanguageQuality(label, criteria));
}

function generatePremiumUpgrade(criteria: NamingCriteria): string[] {
  const current = criteria.currentDomain.replace(/^https?:\/\//, "").split(".")[0] || "";
  const labels = new Set<string>(generateBusinessBrand(criteria));
  if (current) {
    addLabel(labels, current, criteria.constraints);
    addLabel(labels, "get" + capitalize(current), criteria.constraints);
    addLabel(labels, capitalize(current) + "HQ", criteria.constraints);
  }
  return [...labels];
}

const STRATEGIES: Record<BuyingIntent, LabelGenerator> = {
  local_service: generateLocalService,
  business_brand: generateBusinessBrand,
  saas_app: generateSaasApp,
  seo_content: generateSeoContent,
  personal_brand: generatePersonalBrand,
  ecommerce_store: generateEcommerce,
  campaign_landing: generateCampaign,
  brand_protection: generateProtection,
  domain_investment: generateInvestment,
  premium_upgrade: generatePremiumUpgrade,
};

/** When description signals local business but intent is brand/ecom/campaign, blend strategies. */
function shouldBlendLocalStrategy(criteria: NamingCriteria): boolean {
  return (
    criteria.isLocalContext &&
    criteria.hasSubject &&
    criteria.intent !== "local_service" &&
    criteria.intent !== "seo_content" &&
    criteria.intent !== "brand_protection" &&
    criteria.intent !== "domain_investment"
  );
}

function shouldAllowSeoBackfill(criteria: NamingCriteria): boolean {
  return (
    criteria.intent === "seo_content" ||
    criteria.constraints.preferExactMatch ||
    criteria.constraints.preferKeywordSlug
  );
}

/** Generate domain labels using the intent-specialized strategy for this brief. */
export function generateLabelsForIntent(criteria: NamingCriteria): string[] {
  let labels: string[];

  if (shouldBlendLocalStrategy(criteria)) {
    labels = [
      ...generateSubjectAnchoredBrand(criteria),
      ...generateLocalService(criteria),
      ...STRATEGIES[criteria.intent](criteria),
    ];
  } else {
    labels = STRATEGIES[criteria.intent](criteria);
  }

  if (labels.length < 8 && shouldAllowSeoBackfill(criteria)) {
    const secondary = generateSeoContent(criteria).slice(0, 8);
    labels = [...new Set([...labels, ...secondary])];
  } else if (labels.length < 8 && criteria.hasSubject) {
    labels = [...new Set([...labels, ...generateSubjectAnchoredBrand(criteria)])];
  }

  const seen = new Set<string>();
  return labels.filter((label) => {
    const key = label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);

    if (criteria.hasSubject && isGenericFallbackLabel(label)) return false;
    if (!passesLanguageQuality(label, criteria)) return false;

    if (criteria.constraints.preferBrandable && label.includes("-")) return false;
    return true;
  });
}

function isGenericFallbackLabel(label: string): boolean {
  const norm = label.toLowerCase();
  return GENERIC_BRAND_FALLBACK.some((g) => norm.startsWith(g.toLowerCase()));
}

function isRawKeywordSlug(label: string, criteria: NamingCriteria): boolean {
  const norm = label.toLowerCase().replace(/-/g, "");
  const s = criteria.service.toLowerCase();
  const c = criteria.locationCity.toLowerCase();
  if (!s || !c) return false;
  return norm === s + c || norm === c + s;
}

function isBusinessStyleLocalName(label: string): boolean {
  return (
    /[a-z][A-Z].*[A-Z]/.test(label) ||
    /(Co|Pros|Group|Team|HQ|Slice|Pie|Oven|Works|House)$/i.test(label)
  );
}

function isWeakGenericBrand(label: string): boolean {
  const norm = label.toLowerCase();
  return (
    /^(pro|co|hub|works|craft|house)(pro|co|hub|works|craft|house)/.test(norm) ||
    ["proco", "cohub", "hubworks", "worksco", "worksworks", "cocraft"].includes(norm)
  );
}

function isIndustryBrandCompound(label: string): boolean {
  return (
    /^(guard|shield|secure|safe|sentry|haven|alert|watch|lock|trust|nest|home)/i.test(label) ||
    /[a-z][A-Z].*[A-Z]/.test(label)
  );
}

/** Rank labels before TLD expansion — intent-aware ordering. */
export function rankLabelsForIntent(labels: string[], criteria: NamingCriteria): string[] {
  if (criteria.intent === "business_brand" || criteria.intent === "saas_app") {
    return [...labels].sort((a, b) => {
      const score = (label: string) => {
        if (isGenericFallbackLabel(label)) return 10;
        if (isWeakGenericBrand(label)) return 9;
        if (isIndustryBrandCompound(label) && label.length >= 8 && label.length <= 14) return 0;
        if (isIndustryBrandCompound(label)) return 1;
        if (/[a-z][A-Z]/.test(label)) return 2;
        return 5;
      };
      const diff = score(a) - score(b);
      if (diff !== 0) return diff;
      return a.length - b.length;
    });
  }

  const rankBySubject =
    criteria.intent === "local_service" ||
    (criteria.hasSubject && criteria.isLocalContext);

  if (!rankBySubject) return labels;

  const { locationKeywords, service } = criteria;
  const primaryService = service.toLowerCase();

  return [...labels].sort((a, b) => {
    const score = (label: string) => {
      const norm = label.toLowerCase().replace(/-/g, "");
      const hasLoc = locationKeywords.some((t) => norm.includes(t.replace(/-/g, "")));
      const hasSvc =
        (primaryService && norm.includes(primaryService)) ||
        criteria.serviceKeywords.some(
          (t) => t.length > 3 && norm.includes(t) && t !== "parlour" && t !== "parlor"
        );
      const isGeneric = isGenericFallbackLabel(label);
      const isRawSlug = isRawKeywordSlug(label, criteria);
      const isBusiness = isBusinessStyleLocalName(label);
      const hasHyphen = label.includes("-");

      if (isGeneric) return 10;
      if (isBusiness && hasLoc && hasSvc) return 0;
      if (isBusiness && hasLoc) return 1;
      if (hasHyphen && hasLoc && hasSvc) return 2;
      if (hasLoc && hasSvc && !isRawSlug) return 3;
      if (isRawSlug && !criteria.constraints.preferKeywordSlug) return 8;
      if (hasLoc && hasSvc) return 4;
      if (hasSvc) return 5;
      if (hasLoc) return 6;
      return 7;
    };
    const diff = score(a) - score(b);
    if (diff !== 0) return diff;
    return a.length - b.length;
  });
}

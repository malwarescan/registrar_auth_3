import type { SignalKey } from "./signal-model";

export type GuideCriterion = {
  name: string;
  check: string;
  /** How (or whether) NameMog measures this criterion. */
  inApp: string;
};

export type GuideTable = {
  heading: string;
  caption: string;
  columns: string[];
  rows: string[][];
};

export type GuideFaq = { q: string; a: string };

export type GuideLink = { href: string; label: string };

export type Guide = {
  slug: string;
  /** H1 — the question exactly as people ask it. */
  question: string;
  metaTitle: string;
  metaDescription: string;
  /** Direct 2–3 sentence answer shown as the first paragraph. */
  answer: string;
  datePublished: string;
  dateModified: string;
  framework: {
    heading: string;
    intro: string;
    criteria: GuideCriterion[];
  };
  /** Which NameMog signals this guide relies on. */
  signals: SignalKey[];
  table?: GuideTable;
  steps?: { heading: string; items: string[] };
  whenNot: string[];
  mistakes: string[];
  nextStep: { text: string; links: GuideLink[] };
  faqs: GuideFaq[];
  sources: GuideLink[];
  related: string[];
};

const PUBLISHED = "2026-11-04";

const GOOGLE_SEO_STARTER = {
  href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
  label: "Google Search Central: SEO Starter Guide (keywords in domain names, TLDs)",
};
const GOOGLE_NEW_TLDS = {
  href: "https://developers.google.com/search/blog/2015/07/googles-handling-of-new-top-level",
  label: "Google Search Central Blog: Google's handling of new top level domains",
};
const GOOGLE_AI_FEATURES = {
  href: "https://developers.google.com/search/docs/appearance/ai-features",
  label: "Google Search Central: AI features and your website",
};
const ICANN_LOOKUP = {
  href: "https://lookup.icann.org/",
  label: "ICANN Lookup (registration data via RDAP)",
};
const NAMESILO_MARKETPLACE = {
  href: "https://www.namesilo.com/support/v2/articles/account-options/marketplace",
  label: "NameSilo support: Marketplace",
};
const WAYBACK = { href: "https://web.archive.org/", label: "Internet Archive Wayback Machine" };

const SEARCH_CTA: GuideLink = { href: "/", label: "Search and score names" };
const COMPARE_EXAMPLE: GuideLink = {
  href: "/compare?domains=brightnest-com,smartecohome-com,ecohometech-net&q=smart%20eco%20home",
  label: "See an example side-by-side comparison",
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-score-a-domain-name-for-branding",
    question: "How to score a domain name for branding",
    metaTitle: "How to Score a Domain Name for Branding (Scorecard + Weights)",
    metaDescription:
      "A practical scorecard for rating domain names as brands: what to score, how to weight it by business type, what an algorithm can and cannot measure, and the mistakes that skew scores.",
    answer:
      "Score each candidate separately on clarity and length, recall when spoken, fit with what you sell, extension trust and price, then weight those scores by what your business depends on instead of trusting one gut number. Measure the parts a tool can compute (length, keyword fit, extension) and test the parts it cannot (pronunciation, meaning, trademark conflicts) with real people and a trademark search. The name that wins is the best trade-off, not the one with the highest single score.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    framework: {
      heading: "The branding scorecard",
      intro:
        "Score every name 0–100 on each row. Rows marked as manual are things no string-based scorer can judge, so do them yourself before you trust any total.",
      criteria: [
        {
          name: "Clarity and length",
          check: "Can someone read the label once and repeat it? Shorter usually wins; past about 12 characters recall drops noticeably.",
          inApp: "Brand Strength: clarity loses 4 points per character past 12 characters and faster past 18.",
        },
        {
          name: "Spoken recall (radio test)",
          check: "Say it once to five people who haven't seen it written. Every one should type it correctly.",
          inApp: "Not scored. Do this manually for your final three.",
        },
        {
          name: "Fit with what you do",
          check: "Does the name hint at your category, or is it abstract enough that you'll pay to explain it?",
          inApp: "Search Relevance and Marketing Clarity measure how many of your query's words the name carries.",
        },
        {
          name: "Room to grow",
          check: "Would it still fit if you added a product line or moved into a new city?",
          inApp: "Not scored. A name that is just your query glued together is marked down for brand-style intents, which partly captures this.",
        },
        {
          name: "Extension trust",
          check: "Will your customers assume .com? Is the alternative extension familiar in your market?",
          inApp: "Trust: .com 100, .net 85, .org 80, .io 75, .co 70, others lower.",
        },
        {
          name: "Price against signal",
          check: "Is the price justified by the scores, compared with your next-best option?",
          inApp: "Value: the average signal minus a price penalty.",
        },
        {
          name: "Legal clearance",
          check: "Search your national trademark database for the name in your category.",
          inApp: "Not scored. Always manual.",
        },
      ],
    },
    signals: ["brand", "marketing", "search", "trust", "value"],
    table: {
      heading: "How common name types tend to score",
      caption:
        "Tendencies under NameMog's model for a business-brand search; individual names vary with length and extension.",
      columns: ["Name type", "Example pattern", "Brand Strength", "Search Relevance", "Main risk"],
      rows: [
        ["Descriptive (your query, joined)", "smarthomesecurity.com", "Medium to low if long", "Marked down for brand intents", "Generic, hard to own, often long"],
        ["Short compound", "brightnest.com", "High (6–14 character bonus)", "Medium; depends on words used", "May need a tagline to explain"],
        ["Keyword + modifier", "getbrightnest.com", "Medium; longer label", "Medium", "Feels like a fallback if the base .com belongs to someone else"],
        ["Invented word", "a coined 5–8 letter name", "High if short", "Low; no query words", "Spelling ambiguity; you must build all meaning"],
        ["Hyphenated", "bright-nest.com", "Lower in brand mode", "Similar to unhyphenated", "Fails the radio test; people drop the hyphen"],
      ],
    },
    whenNot: [
      "Don't rely on a score when choosing between two names a trademark search hasn't cleared. Legal risk overrides every other row.",
      "Don't weight branding heavily for a short-lived campaign or a pure content site. Use your actual buying intent; a local service business weights search and trust more than brand.",
      "Don't score names you can't actually buy. Check availability and price first so the shortlist isn't full of names you can't get.",
    ],
    mistakes: [
      "Using one 1–10 gut score per name. It hides the trade-off between memorability and descriptiveness, which is the actual decision.",
      "Judging names only on screen. Spelling problems show up when the name is spoken, not read.",
      "Treating a long descriptive .com as automatically better than a short compound on a familiar alternative extension. Score both and compare.",
      "Changing weights after you've fallen for a name. Set the weights from your business model first, then score.",
    ],
    nextStep: {
      text: "Describe your business in the search box and pick your buying intent. NameMog scores every candidate on the signals above using the weights for that intent, and you can change the weights in the side panel.",
      links: [SEARCH_CTA, COMPARE_EXAMPLE],
    },
    faqs: [
      {
        q: "What is a good brand score for a domain name?",
        a: "There is no universal cut-off. Compare scores between your own candidates for the same query and intent. A name that leads on Brand Strength by 10+ points while staying close on Search Relevance is usually the stronger brand choice.",
      },
      {
        q: "Should branding or SEO matter more when scoring a domain?",
        a: "It depends on how customers will find you. Google says keywords in a domain name have hardly any ranking effect beyond appearing in breadcrumbs, so most businesses should weight memorability and trust above keyword match. Search-led content sites are the exception.",
      },
      {
        q: "How long should a brandable domain be?",
        a: "Aim for 12 characters or fewer before the extension. NameMog's clarity score starts falling after 12 characters, and its name generator caps brand-style names at 14.",
      },
      {
        q: "Can a tool tell me if a domain name is a good brand?",
        a: "Only partly. A tool can measure length, keyword fit and extension trust consistently across many names. It cannot hear how a name sounds, know what it means in other languages, or clear trademarks; you have to check those yourself.",
      },
    ],
    sources: [GOOGLE_SEO_STARTER],
    related: [
      "what-signals-make-a-domain-name-valuable",
      "how-to-pick-a-domain-name-that-is-easy-to-say",
      "how-to-shortlist-domain-names-for-a-new-company",
    ],
  },
  {
    slug: "what-signals-make-a-domain-name-valuable",
    question: "What signals make a domain name valuable?",
    metaTitle: "What Signals Make a Domain Name Valuable? (Use Value vs Resale Value)",
    metaDescription:
      "The signals that make a domain name valuable — length, extension, meaning, recall, history and legal cleanliness — split into what helps your business and what drives resale, with how to check each.",
    answer:
      "A domain is valuable when it is short, easy to say and spell, on an extension buyers trust (usually .com), meaningful in a market people spend money in, and free of trademark conflicts and a bad history. Separate value to your business (does it help customers find, remember and trust you) from resale value (would another buyer pay for it); the same name can be strong on one and weak on the other.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    framework: {
      heading: "Value signals checklist",
      intro: "Work down the list. The first five can be read from the name itself; the last three need research about the specific domain.",
      criteria: [
        {
          name: "Length",
          check: "Fewer characters means fewer typos and more scarcity. Count the label, not the extension.",
          inApp: "Brand Strength (clarity) and Resale Potential (+15 for 10 characters or fewer).",
        },
        {
          name: "Extension",
          check: "Is the extension what your buyers type by habit? For resale, .com has the deepest buyer pool.",
          inApp: "Trust and Resale Potential, both driven by the extension.",
        },
        {
          name: "Meaning and commercial demand",
          check: "Do the words describe something people buy? Category words carry more value than abstract ones.",
          inApp: "Search Relevance measures keyword fit to your query, not market demand.",
        },
        {
          name: "Brandability and recall",
          check: "Does it sound like a company? Would people remember it after hearing it once?",
          inApp: "Brand Strength approximates this from length and structure; recall itself is not scored.",
        },
        {
          name: "Price",
          check: "What you pay against your next-best option.",
          inApp: "Value: average signal minus a price penalty.",
        },
        {
          name: "History",
          check: "Was the domain used before, and for what? Spam or unrelated past use can carry baggage.",
          inApp: "Not scored. Check the Wayback Machine.",
        },
        {
          name: "Existing links and traffic",
          check: "A previously used domain may have relevant inbound links.",
          inApp: "Not scored. Use a backlink tool.",
        },
        {
          name: "Trademark cleanliness",
          check: "Does the name collide with a registered mark in a related category?",
          inApp: "Not scored. Search the trademark database yourself.",
        },
      ],
    },
    signals: ["brand", "search", "trust", "resale", "value"],
    table: {
      heading: "Business value vs resale value",
      caption: "Which signals matter more depends on whether you're building on the name or holding it.",
      columns: ["Signal", "Matters for your business", "Matters for resale", "How to check"],
      rows: [
        ["Short label", "High: easier recall and typing", "High: scarcity", "Count characters; NameMog Brand Strength"],
        [".com extension", "High if your customers type .com by habit", "Very high", "NameMog Trust and Resale"],
        ["Category keyword", "Medium: clarity for customers", "High if the category is commercial", "NameMog Search Relevance against your query"],
        ["Pronounceable", "High: word of mouth", "Medium", "Radio test with five people"],
        ["Clean history", "High: no inherited baggage", "High", "Wayback Machine snapshots"],
        ["No trademark conflict", "Critical", "Critical", "Trademark database search"],
        ["Existing backlinks", "Low to medium", "Medium", "Backlink tool, then manual review"],
      ],
    },
    whenNot: [
      "Don't pay a premium for keyword value if search isn't how you'll get customers. Google says keywords in the domain have hardly any ranking effect beyond breadcrumbs.",
      "Don't pay for resale signals (.com, very short) if you'll never sell and a slightly longer name works for your customers.",
      "Don't buy a previously used domain for its backlinks without reviewing what those links are and where they come from.",
    ],
    mistakes: [
      "Treating an appraisal number as a price. Automated appraisals and heuristic scores, NameMog's included, are not comparable-sales evidence.",
      "Assuming a newer extension ranks better because it contains a keyword. Google says keywords in a TLD give no advantage or disadvantage in search.",
      "Ignoring history. A domain used for spam or an unrelated business can confuse customers who remember it.",
      "Confusing value to you with market value. A name can be worth a lot to your business and little to anyone else.",
    ],
    nextStep: {
      text: "Run your business description through NameMog to see Brand, Search, AI/Entity, Trust, Resale and Value scores side by side for each candidate. Then do the history and trademark checks for your finalists.",
      links: [SEARCH_CTA, COMPARE_EXAMPLE],
    },
    faqs: [
      {
        q: "Does the extension change how valuable a domain is?",
        a: "Yes for user trust and resale: .com has the largest buyer pool and is what many people type by habit. For Google rankings it doesn't matter much; Google says the TLD only matters if you target a specific country, and even then it is usually a low-impact signal.",
      },
      {
        q: "Do keyword domains rank better in Google?",
        a: "Not meaningfully. Google's SEO Starter Guide says keywords in a domain name alone have hardly any effect beyond appearing in breadcrumbs. Keyword domains can still help people understand what you do.",
      },
      {
        q: "How do I check a domain's history before buying?",
        a: "Look the domain up in the Internet Archive's Wayback Machine to see past versions of the site, and search Google for the domain to see what others said about it. If it hosted spam or something unrelated to you, weigh that before paying.",
      },
      {
        q: "Is NameMog's Resale Potential score an appraisal?",
        a: "No. It is a structural score built from extension trust, label length and whether the name is a .com. Use it to compare candidates, not to price a sale.",
      },
    ],
    sources: [GOOGLE_SEO_STARTER, GOOGLE_NEW_TLDS, WAYBACK],
    related: [
      "how-to-score-a-domain-name-for-branding",
      "how-to-check-domain-name-seo-relevance",
      "alternatives-when-the-domain-name-you-want-is-taken",
    ],
  },
  {
    slug: "how-to-pick-a-domain-name-that-is-easy-to-say",
    question: "How to pick a domain name that is easy to say",
    metaTitle: "How to Pick a Domain Name That Is Easy to Say and Spell",
    metaDescription:
      "A repeatable radio test for domain names, the spelling traps that break it (homophones, numbers, hyphens, word-boundary misreads), and how to fix a name that fails.",
    answer:
      "Pick a name that someone can type correctly after hearing it once: real words or plain phonetic spellings, no numbers or hyphens you'd have to explain, and no word boundary that reads two ways. Test it with the radio test: say it once to five people who haven't seen it written, ask them to type it, and drop or fix any name that anyone gets wrong.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    framework: {
      heading: "Say-it and spell-it checklist",
      intro: "A name should pass every row. One failure is usually enough to fix or drop it.",
      criteria: [
        {
          name: "One spelling per sound",
          check: "Avoid homophones and alternative spellings (to/two/too, right/write, s/z or c/k swaps) unless the odd spelling is the whole point of the brand.",
          inApp: "Not scored. NameMog reads text, not sound.",
        },
        {
          name: "No digits or hyphens you have to say out loud",
          check: "\"Four\" or \"4\"? \"Dash\" or no dash? Every explanation costs visitors.",
          inApp: "NameMog's generator drops names that start with a number and, for brand-style intents, hyphenated names.",
        },
        {
          name: "Clean word boundaries",
          check: "Write the name in lowercase and read it as a stranger would. Joined words can form an unintended word across the boundary.",
          inApp: "Not scored. Read it aloud and ask someone else to.",
        },
        {
          name: "Few syllables",
          check: "Two or three syllables are easiest to hear and repeat.",
          inApp: "Brand Strength rewards shorter labels, which tracks with fewer syllables.",
        },
        {
          name: "No doubled letters at a join",
          check: "A join that doubles a letter (\"cool\" + \"labs\" → coollabs) makes people unsure how many to type.",
          inApp: "Not scored.",
        },
        {
          name: "The extension people will assume",
          check: "If you say \"brightnest\" without an extension, most people will type .com.",
          inApp: "Trust is highest for .com.",
        },
      ],
    },
    signals: ["brand", "trust"],
    steps: {
      heading: "How to run the radio test",
      items: [
        "Pick your top 3–5 names. Don't show them in writing to the testers.",
        "Say each name once at normal speed, as you would on a call: \"brightnest dot com\".",
        "Ask each person to type it into their phone right away.",
        "Count exact matches. A name passes only if all five type it correctly.",
        "For any miss, write down what they typed. That is the spelling your customers will use, so either fix the name or plan to own that variant too.",
      ],
    },
    table: {
      heading: "Common failures and fixes",
      caption: "Patterns that break the radio test and what to do instead.",
      columns: ["Pattern", "Why it fails when spoken", "Fix"],
      rows: [
        ["Number substitution (4 for \"for\")", "Listener can't tell digit from word", "Use the word, or own both versions and redirect one"],
        ["Hyphenated label", "People drop the hyphen when typing", "Use the unhyphenated form or a different name"],
        ["Creative spelling (dropped vowels, k for c)", "Listener types the dictionary spelling", "Use the dictionary spelling unless the brand is already known"],
        ["Homophone (night/knight)", "Two correct-sounding spellings", "Choose a word with one obvious spelling"],
        ["Ambiguous word boundary", "Joined words read as other words", "Reorder, add a word, or capitalize in logos (doesn't fix the URL)"],
        ["Long multi-word label", "Listener forgets the order or a word", "Cut to the two words that carry the meaning"],
      ],
    },
    whenNot: [
      "Don't throw out a short invented name just because it's new. Unfamiliar is fine if the spelling is obvious from the sound.",
      "Don't rely on capitalization (BrightNest) to fix a boundary problem. Domains are case-insensitive and appear in lowercase in many places.",
      "Don't skip the test for a name you'll mostly use in print. Customers will still say it to each other.",
    ],
    mistakes: [
      "Testing with people who have already seen the name written.",
      "Spelling the name out during the test. If you have to spell it, it failed.",
      "Testing only the .com version. If you're using a different extension, say the whole thing including the extension.",
      "Buying the creative spelling without also buying the dictionary spelling people will type.",
    ],
    nextStep: {
      text: "Use NameMog to generate and score candidates, save the short, clean ones to your shortlist, then run the radio test on your top three before you buy.",
      links: [SEARCH_CTA, { href: "/portfolio", label: "Open your saved shortlist" }],
    },
    faqs: [
      {
        q: "What is the radio test for domain names?",
        a: "You say the domain once, out loud, to someone who hasn't seen it written, and they try to type it. If they type it correctly without asking how it's spelled, the name passes.",
      },
      {
        q: "How do I check if a domain name is easy to spell?",
        a: "Run the radio test with about five people and note every wrong spelling. Then check the name for homophones, digits, hyphens, doubled letters at a word join and unintended words across the boundary.",
      },
      {
        q: "Are hyphens in domain names bad?",
        a: "For a brand you'll say out loud, usually yes, because people forget or drop the hyphen. Hyphens do make word boundaries unambiguous in writing, which is why NameMog gives them a small clarity bonus, but they cost you on spoken recall.",
      },
      {
        q: "Should I buy common misspellings of my domain?",
        a: "If your radio test shows a consistent misspelling, buying that variant and redirecting it is a cheap way to catch lost visitors. Don't buy misspellings of other companies' brands.",
      },
    ],
    sources: [],
    related: [
      "how-to-score-a-domain-name-for-branding",
      "how-to-shortlist-domain-names-for-a-new-company",
      "how-to-find-a-domain-name-similar-to-a-taken-one",
    ],
  },
  {
    slug: "how-to-shortlist-domain-names-for-a-new-company",
    question: "How to shortlist domain names for a new company",
    metaTitle: "How to Shortlist Domain Names for a New Company (Step by Step)",
    metaDescription:
      "Go from a brainstorm to a final domain in seven steps: write a brief, generate widely, apply hard filters, score with weights that match your business, compare three finalists and test them with people.",
    answer:
      "Write a one-line brief and decide how customers will find you, generate a wide pool of 30–50 names across different styles, cut everything that fails hard filters (budget, availability, trademark, radio test), then score the survivors with weights that match your business. Keep three finalists, compare them side by side and test them with real people before you buy.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    framework: {
      heading: "Shortlist filters and scoring",
      intro: "Hard filters remove names outright. Scoring ranks what's left. Doing them in this order saves you from falling for a name you can't use.",
      criteria: [
        {
          name: "Available within budget",
          check: "Can you register it or buy it at a price you'll actually pay?",
          inApp: "NameMog's recommendations only come from candidates it found to be buyable: available to register or listed for sale.",
        },
        {
          name: "Trademark clear",
          check: "No conflicting registered mark in your category.",
          inApp: "Not checked. Search the trademark database.",
        },
        {
          name: "Passes the radio test",
          check: "Five people type it correctly after hearing it once.",
          inApp: "Not scored.",
        },
        {
          name: "Structurally clean",
          check: "Not too long, no repeated words, no keyword stuffing, no leading digits.",
          inApp: "NameMog's generator rejects labels over 14 characters for brand intents, four-plus-word joins, repeated roots and names starting with a number.",
        },
        {
          name: "Scores well on what matters to you",
          check: "Rank by weighted score using your priorities.",
          inApp: "Overall score uses weights for your buying intent; you can adjust Brand, SEO, AI visibility, Trust, Value and Resale.",
        },
      ],
    },
    signals: ["brand", "search", "ai", "trust", "value"],
    steps: {
      heading: "The seven-step shortlist",
      items: [
        "Write a brief: what you sell, to whom, where, and how customers will find you (word of mouth, search, ads, marketplace).",
        "Generate 30–50 names across styles: descriptive, short compound, keyword + modifier, invented word, and location-based if you're local.",
        "Apply hard filters: availability and budget, trademark search, structural problems. Expect to lose most of the list.",
        "Score the survivors with weights that fit your business, set before you look at the names.",
        "Keep the top three. Make sure they aren't all the same style, so you're choosing between real alternatives.",
        "Compare the three side by side, then run the radio test and a gut check with a few target customers.",
        "Buy the winner, and consider the obvious misspelling or the .com/.net pair if it's cheap.",
      ],
    },
    table: {
      heading: "Default weights by buying intent in NameMog",
      caption: "Starting weights (higher means more influence on the overall score). You can change them before ranking.",
      columns: ["Buying intent", "Brand", "SEO", "AI visibility", "Trust", "Value", "Resale"],
      rows: [
        ["Business brand", "2.5", "1", "1.2", "2", "1", "0.5"],
        ["SaaS / app / tech product", "2.5", "1", "2.5", "1.2", "1", "1"],
        ["Local service business", "1.2", "2.5", "0.8", "2.5", "1", "0.3"],
        ["Ecommerce store", "2.2", "1.2", "1", "2.5", "1", "0.5"],
        ["SEO content site", "1", "3", "2", "1.2", "1", "0.5"],
      ],
    },
    whenNot: [
      "Don't shortlist before you've written the brief. Without it, you'll score names against a moving target.",
      "Don't keep a name on the list because it's clever if it fails the radio test.",
      "Don't wait for the perfect .com if a strong alternative is available now and your customers don't care about the extension.",
    ],
    mistakes: [
      "Brainstorming only in one style, so the shortlist is three versions of the same idea.",
      "Scoring before filtering, which makes you attached to names you can't buy or legally use.",
      "Asking friends which name they 'like' instead of testing whether they can remember and spell it.",
      "Forgetting the extension in tests and on the shortlist; brightnest.com and brightnest.co are different decisions.",
    ],
    nextStep: {
      text: "Start a search in NameMog with your brief and buying intent. Save the names you like to your shortlist, then open Compare to rank up to three finalists side by side.",
      links: [SEARCH_CTA, { href: "/compare", label: "Compare your shortlist" }],
    },
    faqs: [
      {
        q: "How many domain names should be on a shortlist?",
        a: "Start with 30–50 ideas, filter to around ten, and compare three finalists. Three is enough to see real trade-offs without decision fatigue.",
      },
      {
        q: "Should I pick the company name first or the domain first?",
        a: "Shortlist them together. A name you can't get a usable domain for is a weaker choice, so check domain availability while names are still on the list.",
      },
      {
        q: "What if my favorite name is only available on a non-.com extension?",
        a: "Score it next to your best .com option. If your customers will mostly click links rather than type the address, a familiar alternative extension can be fine; if word of mouth matters, weigh the .com more heavily.",
      },
    ],
    sources: [],
    related: [
      "how-to-score-a-domain-name-for-branding",
      "how-to-pick-a-domain-name-that-is-easy-to-say",
      "alternatives-when-the-domain-name-you-want-is-taken",
    ],
  },
  {
    slug: "alternatives-when-the-domain-name-you-want-is-taken",
    question: "Alternatives when the domain name you want is taken",
    metaTitle: "Alternatives When the Domain Name You Want Is Taken (Compared)",
    metaDescription:
      "Seven options when your domain is taken — buy it, change extension, add a modifier, add a location, hyphenate, respell or rename — compared on cost, risk and how each changes the name's scores.",
    answer:
      "You have seven realistic options: buy the domain from its owner or a marketplace, use a different extension, add a short modifier (get, try, hq, app), add your location, hyphenate it, change the spelling, or pick a new name. Buying keeps the brand intact but costs the most; modifiers and alternative extensions are cheap but weaker for word of mouth; if the taken domain is an active business in your field, rename instead.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    framework: {
      heading: "How to decide",
      intro: "Answer these in order. The first 'yes' usually decides the option.",
      criteria: [
        {
          name: "Is the taken domain an active business in your category?",
          check: "Visit the site. If someone is already trading under that name in your field, a near-copy invites confusion and trademark trouble.",
          inApp: "Not checked. Pick a different name.",
        },
        {
          name: "Is it listed for sale?",
          check: "Look for a 'for sale' landing page or a marketplace listing with a buy-now price or an offer form.",
          inApp: "NameMog shows marketplace listings and premium names with their prices when it finds them.",
        },
        {
          name: "Who owns it?",
          check: "Use ICANN Lookup to see the registrar and status; owner contact details are often redacted for privacy.",
          inApp: "Not checked.",
        },
        {
          name: "How will customers reach you?",
          check: "If mainly by spoken word, protect the exact sound; if mainly by links and ads, a modifier or alternative extension costs less.",
          inApp: "Set your buying intent so weights match how you'll be found.",
        },
        {
          name: "What does the alternative cost in signal?",
          check: "Score each alternative against the same query so you can see what you're giving up.",
          inApp: "Trust and Resale drop with less familiar extensions; Brand Strength drops as labels get longer.",
        },
      ],
    },
    signals: ["brand", "search", "trust", "resale"],
    table: {
      heading: "Options compared",
      caption: "Effects on NameMog scores follow from how each signal is computed; actual scores depend on the specific name and your query.",
      columns: ["Option", "Best when", "Cost / effort", "Main risk", "Effect on NameMog scores"],
      rows: [
        ["Buy the exact domain", "It's listed for sale or the owner isn't using it", "Highest; negotiation can take weeks", "Overpaying; check history before buying", "Unchanged; you keep the original name"],
        ["Different extension (.co, .io, .net)", "Customers click more than they type", "Low", "Visitors type .com out of habit and reach the other owner", "Trust and Resale fall (.com 100, .net 85, .io 75, .co 70)"],
        ["Add a modifier (get, try, hq, app)", "Product or app brand", "Low", "Feels secondary if the base .com is well known", "Longer label lowers Brand clarity past 12 characters"],
        ["Add your location", "You serve one city or region", "Low", "Limits you if you expand", "Search Relevance rises for local queries"],
        ["Hyphenate it", "Rarely; mainly a backup to redirect", "Low", "People drop the hyphen when typing", "Brand Strength lower for brand intents; Trust −3"],
        ["Change the spelling", "The respelling is obvious from the sound", "Low", "Fails the radio test; leaks traffic to the original", "Little change; the score can't hear the problem"],
        ["Pick a new name", "Taken domain is an active brand in your field", "Medium (new brainstorm)", "Time", "Fresh scores; often the cleanest result"],
      ],
    },
    whenNot: [
      "Don't use a modifier, hyphen or different extension when the original domain belongs to an active company in your industry.",
      "Don't buy a taken domain without checking its history in the Wayback Machine and confirming the seller can transfer it.",
      "Don't respell a word (dropping vowels, swapping letters) unless the new spelling is the only one people would type.",
    ],
    mistakes: [
      "Settling on the .net when a competitor owns the .com in the same field; their site gets your type-in traffic.",
      "Making a first offer before you know your walk-away price. Decide what your best free alternative is worth first.",
      "Stacking fixes (hyphen + modifier + new extension) until the name no longer resembles a brand.",
      "Assuming a newer extension will rank better because it contains a keyword. Google says it doesn't.",
    ],
    nextStep: {
      text: "Enter your name or business description in NameMog. Taken names stay visible as benchmarks, but recommendations come only from buyable alternatives, so you can see what each workaround costs in score.",
      links: [SEARCH_CTA, COMPARE_EXAMPLE],
    },
    faqs: [
      {
        q: "Can I buy a domain name that is already taken?",
        a: "Sometimes. If it's listed on a marketplace with a buy-now price you can purchase it directly; otherwise you can make an offer through the marketplace or the owner's landing page. Some owners won't sell at any price.",
      },
      {
        q: "How do I find out who owns a domain?",
        a: "Use ICANN Lookup, which returns registration data over RDAP: registrar, dates and status. Owner contact details are often redacted, in which case contact the owner through the registrar or a for-sale page.",
      },
      {
        q: "Is it OK to use .co or .io if the .com is taken?",
        a: "It can be, especially for tech products whose customers arrive through links. The risk is that people type .com by habit and land on someone else's site, so weigh how much of your traffic will come from spoken word.",
      },
      {
        q: "How does buying through the NameSilo Marketplace work?",
        a: "According to NameSilo's support page, sellers can set a buy-now price, run an auction or take offers, and some sales support payment plans. Domains with a buy-now price can be purchased immediately.",
      },
    ],
    sources: [ICANN_LOOKUP, NAMESILO_MARKETPLACE, GOOGLE_NEW_TLDS, WAYBACK],
    related: [
      "how-to-find-a-domain-name-similar-to-a-taken-one",
      "how-to-shortlist-domain-names-for-a-new-company",
      "what-signals-make-a-domain-name-valuable",
    ],
  },
  {
    slug: "how-to-find-a-domain-name-similar-to-a-taken-one",
    question: "How to find a domain name similar to a taken one",
    metaTitle: "How to Find a Domain Name Similar to a Taken One",
    metaDescription:
      "A systematic variation method for finding an available domain close to a taken one, scoring the variants against the same query, and avoiding names that look like copies.",
    answer:
      "Keep the part of the name that carries the meaning and vary the rest systematically: swap the extension, add a short prefix or suffix, reorder the words, swap in a synonym, or combine your core word with a new one. Then score every variant against the same query so you compare like with like, and drop any variant a customer could confuse with the original owner.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    framework: {
      heading: "Variant quality checklist",
      intro: "Each variant has to pass these before it's worth comparing.",
      criteria: [
        {
          name: "Keeps the meaning",
          check: "The core word that describes your business survives the change.",
          inApp: "Search Relevance falls if your query's words disappear from the name.",
        },
        {
          name: "Stays short",
          check: "The variant is still roughly 12 characters or fewer.",
          inApp: "Brand Strength clarity drops past 12 characters.",
        },
        {
          name: "Not confusable with the original owner",
          check: "Someone familiar with the taken domain wouldn't think you're the same company.",
          inApp: "Not checked. Look at the taken site and search the trademark database.",
        },
        {
          name: "Reads naturally",
          check: "No awkward reversed word order or repeated words.",
          inApp: "NameMog's generator rejects awkward reversals of your query, repeated roots and repeated concepts.",
        },
        {
          name: "Actually buyable",
          check: "Available to register or listed for sale within budget.",
          inApp: "Only buyable candidates are recommended; taken names show as benchmarks.",
        },
      ],
    },
    signals: ["brand", "search", "trust"],
    table: {
      heading: "Variation methods",
      caption: "Illustrative variants of brightnest.com, a demo domain shown as taken in NameMog. Availability of the variants is not implied.",
      columns: ["Method", "Example", "What you keep", "Watch out for"],
      rows: [
        ["Swap extension", "brightnest.co", "The exact label", "Type-in traffic going to the .com"],
        ["Prefix", "getbrightnest.com", "The whole brand word", "Longer label; feels secondary"],
        ["Suffix / descriptor", "brightnesthome.com", "Brand word plus category", "Length; repeated concepts"],
        ["Reorder", "nestbright.com", "Both words", "Unnatural phrasing"],
        ["Synonym swap", "brightroost.com", "Structure and tone", "Loses the original meaning"],
        ["Location", "brightnestdenver.com", "Brand word plus place", "Limits expansion"],
      ],
    },
    whenNot: [
      "Don't build on a variant when the taken domain is an active company in your field. Rename instead.",
      "Don't use deliberate misspellings of another company's domain. That's typosquatting, and it invites legal action.",
      "Don't keep adding words to force availability. Past three words the name stops working as a brand.",
    ],
    mistakes: [
      "Comparing variants against different queries, so the scores aren't comparable.",
      "Picking the variant with the best extension but the worst name.",
      "Not checking whether the original owner also holds the obvious variants.",
      "Forgetting to say the variant out loud; prefixes and suffixes can create awkward sounds.",
    ],
    nextStep: {
      text: "Type the taken name or your business description into NameMog. It generates variants in several naming styles, keeps taken names as benchmarks and scores the buyable ones against your query so you can compare them directly.",
      links: [SEARCH_CTA, COMPARE_EXAMPLE],
    },
    faqs: [
      {
        q: "What's the fastest way to find a similar available domain?",
        a: "Start with the core word and test five methods at once: alternative extension, prefix, suffix, synonym and location. A generator that checks availability saves you from testing names one by one.",
      },
      {
        q: "Is it legal to register a domain similar to someone else's?",
        a: "Similar isn't automatically illegal, but registering a name confusingly similar to an existing trademark, especially in the same industry, can lead to a dispute. Search the trademark database and avoid copies of active brands.",
      },
      {
        q: "Should I add 'get' or 'try' to a taken domain?",
        a: "It works well for apps and products where the call to action fits. For a company name you'll say out loud, it can sound like a workaround; score it next to a fresh name before committing.",
      },
    ],
    sources: [ICANN_LOOKUP],
    related: [
      "alternatives-when-the-domain-name-you-want-is-taken",
      "how-to-pick-a-domain-name-that-is-easy-to-say",
      "how-to-score-a-domain-name-for-branding",
    ],
  },
  {
    slug: "how-do-ai-assistants-choose-which-brand-to-recommend",
    question: "How do AI assistants choose which brand to recommend?",
    metaTitle: "How Do AI Assistants Choose Which Brand to Recommend?",
    metaDescription:
      "What actually shapes AI assistant brand recommendations — training data, retrieved web pages and clear entity signals — what you can control, and how small a role the domain name plays.",
    answer:
      "There is no published ranking formula. Assistants generate answers from what their model learned in training and, when they search the web, from the pages they retrieve, so brands that are described consistently across many independent sources, and whose own pages state clearly what they are and who they serve, are easier to name with confidence. Your domain name plays a small part: a distinct, unambiguous name makes it easier to tie mentions back to you, but it won't earn recommendations on its own.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    framework: {
      heading: "Entity clarity checklist",
      intro: "These are the parts you control. None guarantees a recommendation; together they make your brand easier to identify and describe.",
      criteria: [
        {
          name: "A distinct name",
          check: "Is your name unique enough that a search for it returns you, not a generic phrase or another company?",
          inApp: "AI/Entity Clarity scores how cleanly the name parses (length, word coverage and order). It does not check for name collisions.",
        },
        {
          name: "One consistent name everywhere",
          check: "Same name and spelling on your site, social profiles, directories and press mentions.",
          inApp: "Not checked.",
        },
        {
          name: "A plain statement of what you are",
          check: "Your home and about pages say what you sell, to whom and where, in plain language.",
          inApp: "Not checked. Marketing Clarity only measures how much the name itself says.",
        },
        {
          name: "Third-party mentions",
          check: "Independent reviews, articles, directories and community discussions that describe you accurately.",
          inApp: "Not checked.",
        },
        {
          name: "Indexable, accurate pages",
          check: "For Google's AI features, a page must be indexed and eligible to show with a snippet. Structured data should match visible text.",
          inApp: "Not checked.",
        },
      ],
    },
    signals: ["ai", "marketing"],
    table: {
      heading: "What influences a recommendation, and where the domain fits",
      caption: "General factors; individual assistants differ and don't publish their methods.",
      columns: ["Factor", "What you control", "Role of the domain name"],
      rows: [
        ["Training data", "Being written about over time", "Small: a distinct name makes mentions unambiguous"],
        ["Retrieved web pages", "Clear, indexable pages that answer the questions your buyers ask", "Small: the domain is where those pages live"],
        ["Entity clarity", "Consistent name, description and profiles", "Moderate: generic names are harder to tell apart"],
        ["Third-party corroboration", "Reviews, press, directories", "Small"],
        ["Fit to the user's question", "Being specific about who you serve", "Small: a descriptive name can hint at category"],
      ],
    },
    whenNot: [
      "Don't buy a generic keyword domain hoping AI assistants will recommend it. A generic phrase is harder to recognize as one specific company.",
      "Don't treat any 'AI visibility' score, including NameMog's AI/Entity Clarity, as a measure of how often assistants mention you. NameMog's score is about the name only.",
      "Don't rebrand to chase AI recommendations if your current name is distinct and consistent. Fix your pages and mentions first.",
    ],
    mistakes: [
      "Using different names or spellings across your site and profiles.",
      "Describing yourself with vague slogans instead of saying what you sell.",
      "Assuming there's a special technical requirement for Google's AI features. Google's documentation points to the same requirements as regular Search.",
      "Picking a name that collides with a better-known company, so mentions get attributed to them.",
    ],
    nextStep: {
      text: "When you're choosing a name, use NameMog's AI/Entity Clarity score alongside Brand Strength to favor names that parse cleanly into a distinct entity, then check that no better-known company already uses it.",
      links: [SEARCH_CTA, COMPARE_EXAMPLE],
    },
    faqs: [
      {
        q: "Does my domain name affect whether ChatGPT or Google's AI recommends my brand?",
        a: "Only a little. A distinct, consistent name helps systems connect mentions to you, but recommendations depend far more on what's written about you and on your pages being clear and indexable.",
      },
      {
        q: "How do I get my site into Google AI Overviews or AI Mode?",
        a: "Google's documentation says that to be shown as a supporting link, a page must be indexed and eligible to appear in Google Search with a snippet. There's no separate technical requirement beyond normal Search.",
      },
      {
        q: "What does NameMog's AI/Entity Clarity score mean?",
        a: "It estimates how easily a domain name parses into a clear entity, based on length, how many of your query's words it contains and in what order. It doesn't measure mentions or recommendations by any AI assistant.",
      },
    ],
    sources: [GOOGLE_AI_FEATURES],
    related: [
      "how-to-check-domain-name-seo-relevance",
      "how-to-score-a-domain-name-for-branding",
      "what-signals-make-a-domain-name-valuable",
    ],
  },
  {
    slug: "how-to-check-domain-name-seo-relevance",
    question: "How to check domain name SEO relevance",
    metaTitle: "How to Check Domain Name SEO Relevance (Name, History, Links)",
    metaDescription:
      "Check a domain's SEO relevance in two parts: whether the name fits your topic (a minor factor, per Google) and, for a used domain, whether its history and links fit. Tools, red flags and what to ignore.",
    answer:
      "Check two separate things: whether the name itself matches what you do, and, if the domain was used before, whether its history and inbound links fit your topic. Google says keywords in a domain name have hardly any ranking effect beyond breadcrumbs, so name relevance matters mainly for people; for a previously used domain, history and links matter more.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    framework: {
      heading: "SEO relevance checks",
      intro: "Run the name checks for every candidate. Run the history checks for any domain that was registered before.",
      criteria: [
        {
          name: "Name matches your topic",
          check: "Does the name contain or clearly suggest what you do, so searchers recognize it in results?",
          inApp: "Search Relevance: share of your query's words in the name, word order, location and clarity.",
        },
        {
          name: "Extension fits your market",
          check: "Only matters for SEO if you target one country, where a country-code extension can help geotargeting.",
          inApp: "NameMog adds +5 for .com and +2 for .net in Search Relevance as a type-in habit proxy; Google says it doesn't care which generic TLD you use.",
        },
        {
          name: "Past use fits your topic",
          check: "Look at old snapshots. Unrelated, spammy or adult past use is a red flag.",
          inApp: "Not checked. Use the Wayback Machine.",
        },
        {
          name: "Inbound links fit your topic",
          check: "Are linking sites in your field? Are anchors natural, or full of unrelated terms?",
          inApp: "Not checked. Use a backlink tool.",
        },
        {
          name: "Currently indexed",
          check: "A site: search shows whether pages are in Google's index. After you own it, Search Console shows manual actions.",
          inApp: "Not checked.",
        },
      ],
    },
    signals: ["search", "marketing"],
    table: {
      heading: "Checks, tools and red flags",
      caption: "Free checks first; paid backlink tools are optional for most new-business domains.",
      columns: ["Check", "Tool", "Good sign", "Red flag"],
      rows: [
        ["Name fit", "NameMog Search Relevance", "Your core words appear in a natural order", "No query words and no clear meaning"],
        ["Past content", "Wayback Machine", "Same or related topic, or never used", "Spam, pharma, gambling or unrelated pages"],
        ["Index status", "site:example.com in Google", "Results match the domain's current use", "Nothing at all for a domain with a long history"],
        ["Inbound links", "Backlink tool (Moz, Ahrefs, Semrush)", "Links from related sites", "Many links from unrelated or low-quality sites"],
        ["Manual actions", "Google Search Console (after purchase)", "No manual actions", "Active manual action"],
      ],
    },
    whenNot: [
      "Don't pay extra for an exact-match keyword domain on SEO grounds alone. Google says the keywords in the domain have hardly any ranking effect.",
      "Don't pick a newer extension because it contains your keyword. Google treats new gTLDs like other gTLDs and says keywords in a TLD give no advantage.",
      "Don't buy a used domain for its links without reviewing them; irrelevant links are not an asset.",
    ],
    mistakes: [
      "Treating a high keyword-match score as a ranking prediction.",
      "Skipping the history check on a domain that looks fresh but was used years ago.",
      "Keyword-stuffing the name (three or four search terms glued together); it reads as spam to people and is harder to remember.",
      "Ignoring that your content and links will determine rankings far more than the name.",
    ],
    nextStep: {
      text: "Score your candidates in NameMog with an SEO content intent to rank by Search Relevance, then run the history checks above on your top picks before buying.",
      links: [SEARCH_CTA, COMPARE_EXAMPLE],
    },
    faqs: [
      {
        q: "Do keywords in a domain name help SEO?",
        a: "Barely. Google's SEO Starter Guide says keywords in the domain name alone have hardly any effect beyond appearing in breadcrumbs. They can still help people recognize what you do.",
      },
      {
        q: "Does the domain extension affect Google rankings?",
        a: "Generally no. Google says it doesn't care which TLD you use unless you're targeting a specific country, where a country-code domain is usually a low-impact signal.",
      },
      {
        q: "How do I check if a domain was penalized?",
        a: "Before buying, check its history in the Wayback Machine and run a site: search. After you own it, verify it in Google Search Console and look at the Manual actions report.",
      },
      {
        q: "What does NameMog's Search Relevance score measure?",
        a: "How well the name matches the words in your query: how many appear, whether they're in order, whether your location is included, and label clarity. It doesn't use search volume, backlinks or ranking data.",
      },
    ],
    sources: [GOOGLE_SEO_STARTER, GOOGLE_NEW_TLDS, WAYBACK],
    related: [
      "what-signals-make-a-domain-name-valuable",
      "how-do-ai-assistants-choose-which-brand-to-recommend",
      "how-to-score-a-domain-name-for-branding",
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

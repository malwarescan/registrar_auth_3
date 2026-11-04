import type { SignalKey } from "./signal-model";

export type GuideCriterion = {
  name: string;
  check: string;
  /** How (or whether) the site's scores cover this criterion. */
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
  /** Guide-specific H2 for the scores section. */
  signalsHeading: string;
  /** One guide-specific sentence per score this guide relies on (full definitions live on /methodology). */
  signalNotes: { key: SignalKey; note: string }[];
  table?: GuideTable;
  steps?: { heading: string; items: string[] };
  /** Optional worked example with real, dated data. */
  example?: { heading: string; intro: string; table: GuideTable; verdict: string };
  whenNotHeading: string;
  whenNot: string[];
  mistakesHeading: string;
  mistakes: string[];
  nextStep: { text: string; links: GuideLink[] };
  faqs: GuideFaq[];
  sources: GuideLink[];
  related: string[];
};

const PUBLISHED = "2026-11-04";
const REVISED = "2026-11-05";

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
const GOOGLE_SPAM_POLICIES = {
  href: "https://developers.google.com/search/docs/essentials/spam-policies",
  label: "Google Search Central: Spam policies (including expired domain abuse)",
};
const GOOGLE_MANUAL_ACTIONS = {
  href: "https://support.google.com/webmasters/answer/9044175",
  label: "Search Console Help: Manual actions report",
};
const SAFE_BROWSING = {
  href: "https://transparencyreport.google.com/safe-browsing/search",
  label: "Google Transparency Report: Safe Browsing site status",
};
const SPAMHAUS = { href: "https://check.spamhaus.org/", label: "Spamhaus: check a domain against its blocklists" };
const MOZ_SPAM_SCORE = {
  href: "https://moz.com/help/link-explorer/link-building/spam-score",
  label: "Moz Help: Spam Score",
};
const USPTO_SEARCH = { href: "https://tmsearch.uspto.gov/", label: "USPTO Trademark Search" };
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

export const HISTORY_SLUG = "how-to-check-a-used-domains-history-before-buying";
/** Former slug of the history guide; 301-redirected in next.config.ts. */
export const HISTORY_OLD_SLUG = "how-to-check-domain-name-seo-relevance";

export const GUIDES: Guide[] = [
  {
    slug: "how-to-score-a-domain-name-for-branding",
    question: "How to score a domain name for branding",
    metaTitle: "How to Score a Domain Name for Branding: Weighted Scorecard",
    metaDescription:
      "Build a weighted branding scorecard for domain names: set the weights from how customers will find you, score each name against fixed anchors, and read the result as a trade-off.",
    answer:
      "Set the weights before you look at any names, based on how customers will find you, then score every name 0–100 on each row against fixed anchors. A business that grows by referrals should weight spoken recall far above keyword match; a search-led content site can reverse that. The scorecard exists to make the trade-off visible, so compare your top two names row by row instead of trusting the totals alone.",
    datePublished: PUBLISHED,
    dateModified: REVISED,
    framework: {
      heading: "Scoring anchors: what high and low look like",
      intro:
        "Anchors stop your scale drifting as you work down the list. Use the same anchors for every name, and treat any row a tool can't score as a manual row.",
      criteria: [
        {
          name: "Memorability",
          check: "High: one coined word or two short real words that a stranger repeats correctly after hearing them once. Low: three or more words, or a word people ask you to spell.",
          inApp: "Partly. Brand Strength rewards short compound labels; spoken recall is a manual row.",
        },
        {
          name: "Category hint",
          check: "High: a word in the name tells a new customer roughly what you sell. Low: so abstract that every ad has to explain it.",
          inApp: "Search Relevance and Marketing Clarity count how many of your query's words the name carries.",
        },
        {
          name: "Distinctiveness",
          check: "High: searching the name in quotes finds nobody else in your field. Low: a stock phrase dozens of businesses already use.",
          inApp: "Not scored. Search the exact name and your trademark register.",
        },
        {
          name: "Stretch",
          check: "High: still fits after a second product line or a second city. Low: names one product, one place or one year.",
          inApp: "Not scored directly. For brand intents a name that only glues your whole query together is marked down, which catches the worst cases.",
        },
        {
          name: "Extension fit",
          check: "High: the extension your customers would guess without being told. Low: one you'd have to say out loud every time.",
          inApp: "Trust is set by the extension, highest for .com.",
        },
        {
          name: "Cost against the runner-up",
          check: "High: priced close to your next-best name. Low: several times the price for a few points of score.",
          inApp: "Value subtracts 1 point per $20 of price, capped at 25 points.",
        },
      ],
    },
    signalsHeading: "Which scores can fill in a branding scorecard",
    signalNotes: [
      { key: "brand", note: "The nearest automated stand-in for the memorability row. Use it to separate names of similar length, not to replace saying the name out loud." },
      { key: "marketing", note: "Fits the category-hint row, because it only rises when a name is short enough to remember and also carries your query words." },
      { key: "trust", note: "Fills the extension-fit row directly; if all your finalists are .com it won't separate them." },
      { key: "value", note: "Covers cost against the runner-up from the listed price only; add renewal and any marketplace fees yourself." },
    ],
    steps: {
      heading: "How to set the weights",
      items: [
        "Write down where your first 100 customers will come from: referrals, search, ads, a marketplace listing or sales calls.",
        "Give the heaviest weight to the row that channel depends on: memorability for referrals and calls, category hint for search, distinctiveness for ads and social.",
        "Keep any single weight to roughly a third of the total, so one row can't decide the result on its own.",
        "Lock the weights, then score. If you change a weight after seeing totals, write down the reason.",
        "Score all finalists in one sitting against the anchors, then look at the rows where your top two names differ most. That gap is the real decision.",
      ],
    },
    table: {
      heading: "Starting weights by buying intent",
      caption:
        "The weights the search starts from for each buying intent (higher means more influence on the overall score). You can change them in the side panel before ranking.",
      columns: ["Buying intent", "Brand", "SEO", "AI visibility", "Trust", "Value", "Resale"],
      rows: [
        ["Business brand", "2.5", "1", "1.2", "2", "1", "0.5"],
        ["SaaS / app / tech product", "2.5", "1", "2.5", "1.2", "1", "1"],
        ["Local service business", "1.2", "2.5", "0.8", "2.5", "1", "0.3"],
        ["Ecommerce store", "2.2", "1.2", "1", "2.5", "1", "0.5"],
        ["SEO content site", "1", "3", "2", "1.2", "1", "0.5"],
        ["Domain investment", "1.5", "1", "0.8", "1.2", "2.5", "3"],
      ],
    },
    whenNotHeading: "When a weighted branding scorecard is the wrong tool",
    whenNot: [
      "When only one name has cleared a trademark search. A scorecard ranks options; with one legal option there is nothing to rank.",
      "For a campaign or event site you'll retire within a year. Take the clearest available name and move on.",
      "When a co-founder or client holds a veto. Collect their must-haves and deal-breakers first and treat them as hard filters, not weights.",
    ],
    mistakesHeading: "Scorecard mistakes that skew the result",
    mistakes: [
      "Giving each name one 1–10 gut score, which hides the trade-off between memorability and descriptiveness.",
      "Scoring without anchors, so the first name you rate sets the scale for everything after it.",
      "Moving the weights once you have a favourite. Set them from the business model, then score.",
      "Counting one quality twice, for example rewarding shortness under memorability and again under a separate length row.",
    ],
    nextStep: {
      text: "Pick the buying intent that matches your main customer channel, adjust the weights in the side panel if your mix is different, and every candidate is ranked with those weights.",
      links: [SEARCH_CTA, COMPARE_EXAMPLE],
    },
    faqs: [
      {
        q: "What is a good brand score for a domain name?",
        a: "There is no universal cut-off. Compare scores between your own candidates for the same query and intent. A name that leads on Brand Strength by 10+ points while staying close on Search Relevance is usually the stronger brand choice.",
      },
      {
        q: "How much weight should SEO get in a branding scorecard?",
        a: "Less than most people expect, unless search is your main channel. For referral- and sales-led businesses, memorability and trust usually deserve more weight than keyword match; for a content site that lives on search, raise the SEO weight and lower brand.",
      },
      {
        q: "How long should a brandable domain be?",
        a: "Aim for 12 characters or fewer before the extension. The clarity part of Brand Strength starts falling after 12 characters, and the name generator caps brand-style names at 14.",
      },
      {
        q: "Should I score names myself or use a tool?",
        a: "Both. A tool applies the same rules to hundreds of names in seconds, which suits the first cut. Your final three still need the human rows: how the name sounds, what it means in your customers' languages and whether it is legally clear.",
      },
    ],
    sources: [USPTO_SEARCH],
    related: [
      "how-to-shortlist-domain-names-for-a-new-company",
      "how-to-pick-a-domain-name-that-is-easy-to-say",
      "what-signals-make-a-domain-name-valuable",
      "how-do-ai-assistants-choose-which-brand-to-recommend",
    ],
  },
  {
    slug: "what-signals-make-a-domain-name-valuable",
    question: "What signals make a domain name valuable?",
    metaTitle: "What Signals Make a Domain Name Valuable? (Use vs Resale)",
    metaDescription:
      "Use value vs resale value: which domain signals help your business, which drive what other buyers would pay, and why the same name can be worth a lot to you and little to the market.",
    answer:
      "Ask first who the value is for. To your business, a domain is valuable when customers can remember, type and trust it; to the resale market, it is valuable when many other buyers would want it, which favours very short .com names built from commercial words. Both kinds of value collapse if the domain has a bad history or a trademark conflict, and one name can score high on one kind and low on the other.",
    datePublished: PUBLISHED,
    dateModified: REVISED,
    framework: {
      heading: "Value signals checklist",
      intro: "The first five signals can be read from the name. The last two need research on the specific domain.",
      criteria: [
        {
          name: "Length",
          check: "Count the label, not the extension. Each character you remove cuts typos and raises scarcity.",
          inApp: "Brand Strength (clarity) and Resale Potential (+15 for 10 characters or fewer).",
        },
        {
          name: "Extension",
          check: "For use value: the extension your buyers type by habit. For resale: how deep the buyer pool is, which is deepest for .com.",
          inApp: "Trust and Resale Potential, both driven by the extension.",
        },
        {
          name: "Commercial demand",
          check: "Do the words name something people pay for? 'Roofing' carries more resale value than 'sunrise'.",
          inApp: "Search Relevance measures fit to your own query, not market demand.",
        },
        {
          name: "Liquidity",
          check: "How many different businesses could use this name? A name only one company could use is worth a lot to that company and little to anyone else.",
          inApp: "Not scored.",
        },
        {
          name: "Price",
          check: "What you pay compared with your next-best option, not compared with an appraisal.",
          inApp: "Value: average signal minus a price penalty.",
        },
        {
          name: "History and inbound links",
          check: "Past content and links can add value or carry baggage. Audit them before paying a premium for a used domain.",
          inApp: "Not scored. Follow the used-domain history audit.",
        },
        {
          name: "Trademark cleanliness",
          check: "Does the name collide with a registered mark in a related category?",
          inApp: "Not scored. Search the trademark database yourself.",
        },
      ],
    },
    signalsHeading: "The scores that track use value and resale value",
    signalNotes: [
      { key: "resale", note: "The only score aimed at the resale side; it is structural (extension, length, .com), so treat it as a sorting aid, never a price." },
      { key: "trust", note: "Feeds both sides: customer confidence for use value and buyer-pool depth for resale." },
      { key: "search", note: "Measures fit with what you do, which is use value; it says nothing about how many other buyers want those words." },
      { key: "value", note: "Weighs the signals against the asking price, which is the number that matters when a premium is on the table." },
    ],
    table: {
      heading: "Business value vs resale value",
      caption: "Which signals matter more depends on whether you're building on the name or holding it.",
      columns: ["Signal", "Matters for your business", "Matters for resale", "How to check"],
      rows: [
        ["Short label", "High: easier recall and typing", "High: scarcity", "Count characters; Brand Strength"],
        [".com extension", "High if your customers type .com by habit", "Very high", "Trust and Resale scores"],
        ["Category keyword", "Medium: clarity for customers", "High if the category is commercial", "Search Relevance against your query"],
        ["Pronounceable", "High: word of mouth", "Medium", "Radio test with five people"],
        ["Clean history", "High: no inherited baggage", "High", "Used-domain history audit"],
        ["No trademark conflict", "Critical", "Critical", "Trademark database search"],
        ["Existing backlinks", "Low to medium", "Medium", "Backlink tool, then manual review"],
      ],
    },
    whenNotHeading: "When to stop paying for value signals",
    whenNot: [
      "When the premium buys keyword match and search isn't how you'll get customers. Google says keywords in a domain name have hardly any effect beyond appearing in breadcrumbs.",
      "When the premium buys resale signals (very short, .com) and you never intend to sell.",
      "When a used domain's price rests on its backlinks and nobody has audited them yet.",
    ],
    mistakesHeading: "Valuation mistakes",
    mistakes: [
      "Treating an appraisal number as a price. Automated appraisals and heuristic scores, these included, are not comparable-sales evidence.",
      "Assuming a newer extension ranks better because it contains a keyword. Google says keywords in a TLD give no advantage or disadvantage in search.",
      "Confusing value to you with market value. A name can be worth a lot to your business and little to anyone else.",
      "Ignoring renewal pricing. Some premium names renew at a premium every year, which changes the real cost.",
    ],
    nextStep: {
      text: "Score your candidates to see Trust, Resale and Value side by side, decide which kind of value you are paying for, then audit the history of any finalist that was used before.",
      links: [SEARCH_CTA, { href: `/guides/${HISTORY_SLUG}`, label: "Audit a used domain's history" }],
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
        q: "Why is a domain worth more to me than its appraisal?",
        a: "An appraisal estimates what the next buyer would pay. Your use value includes things no appraisal sees: branding you've already printed, the cost of renaming and customers who already type the name. You can rationally pay above an appraisal, up to your own use value, as long as you know which number you're paying.",
      },
      {
        q: "Is the Resale Potential score an appraisal?",
        a: "No. It is a structural score built from extension trust, label length and whether the name is a .com. Use it to compare candidates, not to price a sale.",
      },
    ],
    sources: [GOOGLE_SEO_STARTER, GOOGLE_NEW_TLDS],
    related: [
      HISTORY_SLUG,
      "how-to-score-a-domain-name-for-branding",
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
    dateModified: REVISED,
    framework: {
      heading: "Say-it and spell-it checklist",
      intro: "A name should pass every row. One failure is usually enough to fix or drop it.",
      criteria: [
        {
          name: "One spelling per sound",
          check: "Avoid homophones and alternative spellings (to/two/too, right/write, s/z or c/k swaps) unless the odd spelling is the whole point of the brand.",
          inApp: "Not scored. The scores read text, not sound.",
        },
        {
          name: "No digits or hyphens you have to say out loud",
          check: "\"Four\" or \"4\"? \"Dash\" or no dash? Every explanation costs visitors.",
          inApp: "The generator drops names that start with a number and, for brand-style intents, hyphenated names.",
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
    signalsHeading: "What the scores can and can't hear",
    signalNotes: [
      { key: "brand", note: "Shorter labels score higher, which loosely tracks fewer syllables, but nothing in the score can detect a homophone or a misleading word boundary." },
      { key: "trust", note: "Matters here because listeners fill in the extension themselves; a non-.com name has to be spoken with its extension every time." },
    ],
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
    whenNotHeading: "When a radio-test failure isn't a deal-breaker",
    whenNot: [
      "Don't throw out a short invented name just because it's new. Unfamiliar is fine if the spelling is obvious from the sound.",
      "Don't rely on capitalization (BrightNest) to fix a boundary problem. Domains are case-insensitive and appear in lowercase in many places.",
      "Don't skip the test for a name you'll mostly use in print. Customers will still say it to each other.",
    ],
    mistakesHeading: "Radio-test mistakes",
    mistakes: [
      "Testing with people who have already seen the name written.",
      "Spelling the name out during the test. If you have to spell it, it failed.",
      "Testing only the .com version. If you're using a different extension, say the whole thing including the extension.",
      "Buying the creative spelling without also buying the dictionary spelling people will type.",
    ],
    nextStep: {
      text: "Generate and score candidates, save the short, clean ones to your shortlist, then run the radio test on your top three before you buy.",
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
        a: "For a brand you'll say out loud, usually yes, because people forget or drop the hyphen. Hyphens do make word boundaries unambiguous in writing, which is why the AI/Entity Clarity score gives them a small bonus, but they cost you on spoken recall.",
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
      "The process from brainstorm to final domain: write a brief, generate widely, cut with hard filters before you score, keep three finalists of different styles and test them with people.",
    answer:
      "Write a one-line brief, generate 30–50 names in several styles, and cut everything that fails a hard filter (budget, availability, trademark, radio test) before you score anything. Score only the survivors, keep three finalists that aren't all the same style, and test those with real people before you buy. The order matters: filtering first stops you falling for a name you can't get or can't use.",
    datePublished: PUBLISHED,
    dateModified: REVISED,
    framework: {
      heading: "Hard filters: pass or out",
      intro: "These are yes/no questions. A name that fails one is removed, however well it would score.",
      criteria: [
        {
          name: "Available within budget",
          check: "Can you register it or buy it at a price you'll actually pay?",
          inApp: "Recommendations only come from candidates found to be buyable: available to register or listed for sale.",
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
          inApp: "The generator rejects labels over 14 characters for brand intents, four-plus-word joins, repeated roots and names starting with a number.",
        },
        {
          name: "Clean past, if it was used before",
          check: "No spam history, blocklist entry or unrelated brand still attached to the domain.",
          inApp: "Not checked. Run the used-domain history audit on finalists.",
        },
      ],
    },
    signalsHeading: "Where scoring fits in the shortlist",
    signalNotes: [
      { key: "brand", note: "Most useful in step 4, to rank the survivors of the hard filters; don't use it to decide which ideas to generate." },
      { key: "search", note: "Tells you which finalists carry your brief's words, which helps you keep one descriptive option among the three." },
      { key: "ai", note: "Separates names that parse into a clear entity from ones that read as a jumble of words, useful when two finalists are otherwise close." },
      { key: "trust", note: "Flags the extension trade-off early, before you get attached to a .co or .io finalist." },
    ],
    steps: {
      heading: "The seven-step shortlist",
      items: [
        "Write a brief: what you sell, to whom, where, and how customers will find you (word of mouth, search, ads, marketplace).",
        "Generate 30–50 names across styles: descriptive, short compound, keyword + modifier, invented word, and location-based if you're local.",
        "Apply the hard filters above. Expect to lose most of the list.",
        "Score the survivors with weights you set before looking at the names.",
        "Keep the top three, and make sure they aren't all the same style, so you're choosing between real alternatives.",
        "Compare the three side by side, then run the radio test and a gut check with a few target customers.",
        "Buy the winner, and consider the obvious misspelling or the .com/.net pair if it's cheap.",
      ],
    },
    table: {
      heading: "What a shortlist funnel usually looks like",
      caption: "Illustrative numbers for a small-business naming round; your counts will differ, but the shape is typical.",
      columns: ["Stage", "Names in", "Names out", "What removes them"],
      rows: [
        ["Generate", "—", "40", "Nothing yet; volume and variety are the goal"],
        ["Availability and budget", "40", "18", "Taken with no sale listing, or priced above budget"],
        ["Trademark and structure", "18", "10", "Live marks in your class, overlong labels, stuffed keywords"],
        ["Weighted scoring", "10", "3", "Lowest weighted totals; keep three different styles"],
        ["People test", "3", "1", "Radio-test misses and customer reactions"],
      ],
    },
    whenNotHeading: "When to skip a formal shortlist",
    whenNot: [
      "When you already trade under a name and only need its domain. Your job is to get that name or its closest variant, not to brainstorm.",
      "When the brief isn't written yet. Without it you'll filter against a moving target.",
      "When a strong name is available today and your customers don't care about the extension; don't hold the round open waiting for a .com.",
    ],
    mistakesHeading: "Shortlist mistakes",
    mistakes: [
      "Brainstorming only in one style, so the shortlist is three versions of the same idea.",
      "Scoring before filtering, which makes you attached to names you can't buy or legally use.",
      "Asking friends which name they 'like' instead of testing whether they can remember and spell it.",
      "Forgetting the extension in tests and on the shortlist; brightnest.com and brightnest.co are different decisions.",
    ],
    nextStep: {
      text: "Start a search with your brief and buying intent, save the names that survive your filters, then open Compare to put three finalists side by side.",
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
      {
        q: "How long should shortlisting take?",
        a: "For a small business, about a week of part-time work is enough: a day to write the brief and generate, a day to filter, an evening to score, and a few days to run the radio test and a trademark search on the finalists.",
      },
    ],
    sources: [USPTO_SEARCH],
    related: [
      "how-to-score-a-domain-name-for-branding",
      "how-to-pick-a-domain-name-that-is-easy-to-say",
      HISTORY_SLUG,
      "how-do-ai-assistants-choose-which-brand-to-recommend",
    ],
  },
  {
    slug: "alternatives-when-the-domain-name-you-want-is-taken",
    question: "Alternatives when the domain name you want is taken: buy, work around or rename?",
    metaTitle: "Domain Name Taken? Buy It, Work Around It or Rename",
    metaDescription:
      "When the domain you want is taken, the owner's situation decides your move: buy it under a walk-away price, use a workaround, or rename. A decision table, plus how to set your ceiling.",
    answer:
      "Find out who holds the name and what they do with it, because that decides your path. If an active business in your field uses it, rename. If it is parked or listed for sale, set a walk-away price and buy only below it. If it is held but unused and not for sale, a workaround such as another extension or a modifier only makes sense when most customers will reach you through links rather than by typing the name.",
    datePublished: PUBLISHED,
    dateModified: REVISED,
    framework: {
      heading: "Decision questions, in order",
      intro: "Answer these in order. The first clear answer usually decides the path.",
      criteria: [
        {
          name: "Is the taken domain an active business in your category?",
          check: "Visit the site. If someone is already trading under that name in your field, a near-copy invites confusion and trademark trouble.",
          inApp: "Not checked. Pick a different name.",
        },
        {
          name: "Is it listed for sale?",
          check: "Look for a 'for sale' landing page or a marketplace listing with a buy-now price or an offer form.",
          inApp: "Marketplace listings and premium names are shown with their prices when found.",
        },
        {
          name: "Who owns it, and is it locked?",
          check: "ICANN Lookup shows the registrar, dates and status. Owner contact details are often redacted for privacy.",
          inApp: "Not checked.",
        },
        {
          name: "How will customers reach you?",
          check: "If mainly by spoken word, protect the exact sound; if mainly by links and ads, a workaround costs less.",
          inApp: "Set your buying intent so the weights match how you'll be found.",
        },
        {
          name: "What would the workaround cost in score?",
          check: "Score your best workaround against the same query so you can see exactly what you'd give up.",
          inApp: "Trust and Resale drop with less familiar extensions; Brand Strength drops as labels get longer.",
        },
      ],
    },
    signalsHeading: "Scores that help you price the decision",
    signalNotes: [
      { key: "trust", note: "Shows the cost of a different extension in one number (.com 100, .net 85, .io 75, .co 70), which is often the deciding gap between buying and working around." },
      { key: "brand", note: "Drops as a modifier lengthens the label past 12 characters, so it shows when a workaround stops reading like a brand." },
      { key: "resale", note: "Worth checking before you pay a premium: it shows whether the exact name would hold its structural value if you ever sold it." },
    ],
    table: {
      heading: "What the owner's situation tells you to do",
      caption: "Match what you find to a row. If two rows fit, take the more cautious path.",
      columns: ["Situation", "What you see", "Path", "First move"],
      rows: [
        ["Active business in your field", "A live site selling something like what you sell", "Rename", "Start a new shortlist; don't build on a variant"],
        ["Active business in another field", "A live site in an unrelated industry", "Work around, carefully", "Check the trademark register in your class before using a variant"],
        ["Listed with a price", "Marketplace listing or buy-now landing page", "Buy if under your ceiling", "Audit its history, then buy through the marketplace transfer"],
        ["Parked, taking offers", "Ad page or 'make an offer' form", "Negotiate with a ceiling", "Set your walk-away price first; expect weeks"],
        ["Redirects to a bigger company", "The domain forwards to another brand's site", "Rename", "Assume it's a kept brand asset; for example, brightnest.com forwards to angi.com"],
        ["No site, near expiry", "ICANN Lookup shows an expiry date close by and no renewal", "Watch, with a fallback", "Place a backorder and keep your workaround ready"],
      ],
    },
    steps: {
      heading: "How to set a walk-away price",
      items: [
        "Price your best available workaround: its cost plus what you'd spend explaining a less obvious name (a tagline, extra ad copy, a second domain to redirect).",
        "Add what the exact name saves you: type-in visitors who would otherwise reach the current owner, and the cost of renaming later if the workaround doesn't hold up.",
        "That total is your ceiling. Write it down before you contact the seller.",
        "Open below the ceiling and walk away if the price passes it. Your workaround is already scored and ready to buy.",
      ],
    },
    whenNotHeading: "When not to buy the taken domain, even if it's for sale",
    whenNot: [
      "When the seller can't show they control it and the marketplace or registrar can't confirm the transfer.",
      "When the history audit finds spam, malware, a blocklist entry or a manual action you'd inherit.",
      "When the price is above your walk-away number. The workaround you already scored is the better deal.",
    ],
    mistakesHeading: "Negotiation and workaround mistakes",
    mistakes: [
      "Settling on the .net when a competitor owns the .com in the same field; their site gets your type-in traffic.",
      "Making a first offer before you know your walk-away price.",
      "Stacking fixes (hyphen + modifier + new extension) until the name no longer resembles a brand.",
      "Contacting the owner from a well-known company address before you've decided; it signals a funded buyer.",
    ],
    nextStep: {
      text: "Enter the taken name or your business description. Taken names stay visible as benchmarks, and only buyable alternatives are recommended, so you can see what each workaround costs in score before you set your ceiling.",
      links: [SEARCH_CTA, { href: "/guides/how-to-find-a-domain-name-similar-to-a-taken-one", label: "Generate close variants" }],
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
        q: "What if the domain I want is about to expire?",
        a: "Check its expiry date and status in ICANN Lookup, but don't plan around it dropping: many owners renew at the last minute, and an expired name is usually held for a period before it is released. Place a backorder if you want it and keep your fallback ready.",
      },
      {
        q: "How does buying through the NameSilo Marketplace work?",
        a: "According to NameSilo's support page, sellers can set a buy-now price, run an auction or take offers, and some sales support payment plans. Domains with a buy-now price can be purchased immediately.",
      },
    ],
    sources: [ICANN_LOOKUP, NAMESILO_MARKETPLACE],
    related: [
      "how-to-find-a-domain-name-similar-to-a-taken-one",
      HISTORY_SLUG,
      "how-to-shortlist-domain-names-for-a-new-company",
      "what-signals-make-a-domain-name-valuable",
    ],
  },
  {
    slug: "how-to-find-a-domain-name-similar-to-a-taken-one",
    question: "How to find a domain name similar to a taken one",
    metaTitle: "How to Find a Domain Name Similar to a Taken One (6 Methods)",
    metaDescription:
      "Six ways to generate an available domain close to a taken one (extension swap, prefix, suffix, reorder, synonym, location), how to score the variants fairly, and which ones look like copies.",
    answer:
      "Keep the word that carries the meaning and generate variants with six methods: swap the extension, add a prefix, add a suffix or descriptor, reorder the words, swap in a synonym, or add a place. Make several of each, score every variant against the same query so the numbers are comparable, and drop any variant a customer could mistake for the original owner. Whether to use a variant at all is a separate question, answered by the owner's situation.",
    datePublished: PUBLISHED,
    dateModified: REVISED,
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
          inApp: "The generator rejects awkward reversals of your query, repeated roots and repeated concepts.",
        },
        {
          name: "Actually buyable",
          check: "Available to register or listed for sale within budget.",
          inApp: "Only buyable candidates are recommended; taken names show as benchmarks.",
        },
      ],
    },
    signalsHeading: "How the scores treat each kind of variant",
    signalNotes: [
      { key: "brand", note: "Prefixes and suffixes cost points once the label passes 12 characters, so getbrightnest (13) already scores lower than brightnest (10)." },
      { key: "search", note: "Rises when a suffix or location adds one of your query words and falls when a synonym swap removes one, which makes it the quickest way to see whether a variant kept the meaning." },
      { key: "trust", note: "Is the only score an extension swap changes, so use it to price that method on its own." },
    ],
    steps: {
      heading: "A 20-minute variant session",
      items: [
        "Write the taken name and circle the one word you can't lose (for brightnest.com, 'nest').",
        "Make two variants with each of the six methods in the table below: twelve names.",
        "Add the modifiers that suit your product: get, try or use for apps; hq, labs or co for companies; your city or region for local services.",
        "Run all twelve through one search with the same query, so every score is measured against the same words.",
        "Cross out any variant someone could confuse with the original owner, then keep the top three for a comparison.",
      ],
    },
    table: {
      heading: "Variation methods",
      caption: "Illustrative variants of brightnest.com, a demo domain shown as taken in the search. Availability of the variants is not implied.",
      columns: ["Method", "Example", "What you keep", "Watch out for"],
      rows: [
        ["Swap extension", "brightnest.co", "The exact label", "Type-in traffic going to the .com"],
        ["Prefix (get, try, use, my)", "getbrightnest.com", "The whole brand word", "Longer label; feels secondary"],
        ["Suffix / descriptor (hq, labs, home)", "brightnesthome.com", "Brand word plus category", "Length; repeated concepts"],
        ["Reorder", "nestbright.com", "Both words", "Unnatural phrasing"],
        ["Synonym swap", "brightroost.com", "Structure and tone", "Loses the original meaning"],
        ["Location", "brightnestdenver.com", "Brand word plus place", "Limits expansion"],
      ],
    },
    whenNotHeading: "When a close variant is the wrong move",
    whenNot: [
      "When the taken domain is an active company in your field. Rename instead.",
      "When the only available variants are deliberate misspellings of another company's domain. That's typosquatting, and it invites legal action.",
      "When you need a third word to find anything available. Past three words the name stops working as a brand.",
    ],
    mistakesHeading: "Variant mistakes",
    mistakes: [
      "Comparing variants against different queries, so the scores aren't comparable.",
      "Picking the variant with the best extension but the worst name.",
      "Not checking whether the original owner also holds the obvious variants.",
      "Forgetting to say the variant out loud; prefixes and suffixes can create awkward sounds.",
    ],
    nextStep: {
      text: "Type the taken name or your business description into the search. It generates variants in several naming styles, keeps taken names as benchmarks and scores the buyable ones against your query.",
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
      {
        q: "Does changing only the extension count as a similar domain?",
        a: "Yes. It's the simplest variant and the riskiest for word of mouth, because people who hear the name will type .com. It works best when customers arrive through links you control, such as an app store page or ads.",
      },
    ],
    sources: [ICANN_LOOKUP, USPTO_SEARCH],
    related: [
      "alternatives-when-the-domain-name-you-want-is-taken",
      "how-to-pick-a-domain-name-that-is-easy-to-say",
      "how-to-score-a-domain-name-for-branding",
    ],
  },
  {
    slug: "how-do-ai-assistants-choose-which-brand-to-recommend",
    question: "How do AI assistants choose which brand to recommend, and does your domain name matter?",
    metaTitle: "Does Your Domain Name Affect AI Assistant Brand Recommendations?",
    metaDescription:
      "What shapes AI assistant brand recommendations (training data, retrieved pages, clear entity signals), what you can control, and how small a part your domain name plays.",
    answer:
      "There is no published ranking formula. Assistants generate answers from what their model learned in training and, when they search the web, from the pages they retrieve, so brands that are described consistently across many independent sources, and whose own pages state clearly what they are and who they serve, are easier to name with confidence. Your domain name plays a small part: a distinct, unambiguous name makes it easier to tie mentions back to you, but it won't earn recommendations on its own.",
    datePublished: PUBLISHED,
    dateModified: REVISED,
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
    signalsHeading: "What the AI/Entity Clarity score does and doesn't tell you",
    signalNotes: [
      { key: "ai", note: "Estimates how easily the name splits into clear words that describe an entity; it never queries an assistant, so treat it as a naming check, not a visibility metric." },
      { key: "marketing", note: "Helps when you want the name itself to hint at your category, which gives an assistant one more clue about what you do." },
    ],
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
    whenNotHeading: "When changing your domain won't help AI recommendations",
    whenNot: [
      "When you're tempted by a generic keyword domain. A generic phrase is harder to recognize as one specific company.",
      "When you'd be relying on an 'AI visibility' score, including AI/Entity Clarity here, as a measure of how often assistants mention you. This score is about the name only.",
      "When your current name is already distinct and used consistently. Fix your pages and third-party mentions first.",
    ],
    mistakesHeading: "Entity mistakes that confuse assistants",
    mistakes: [
      "Using different names or spellings across your site and profiles.",
      "Describing yourself with vague slogans instead of saying what you sell.",
      "Assuming there's a special technical requirement for Google's AI features. Google's documentation points to the same requirements as regular Search.",
      "Picking a name that collides with a better-known company, so mentions get attributed to them.",
    ],
    nextStep: {
      text: "When you're choosing a name, read AI/Entity Clarity alongside Brand Strength to favor names that parse cleanly into a distinct entity, then check that no better-known company already uses it.",
      links: [SEARCH_CTA, COMPARE_EXAMPLE],
    },
    faqs: [
      {
        q: "Will a keyword domain like bestplumberdenver.com get recommended more?",
        a: "There's no evidence it would. A generic phrase is harder to recognize as one specific business, and assistants lean on what independent sources say about you. A distinct name that is described consistently gives them more to work with.",
      },
      {
        q: "How do I get my site into Google AI Overviews or AI Mode?",
        a: "Google's documentation says that to be shown as a supporting link, a page must be indexed and eligible to appear in Google Search with a snippet. There's no separate technical requirement beyond normal Search.",
      },
      {
        q: "What does the AI/Entity Clarity score mean?",
        a: "It estimates how easily a domain name parses into a clear entity, based on length, how many of your query's words it contains and in what order. It doesn't measure mentions or recommendations by any AI assistant.",
      },
    ],
    sources: [GOOGLE_AI_FEATURES],
    related: [
      "how-to-score-a-domain-name-for-branding",
      "how-to-shortlist-domain-names-for-a-new-company",
      "what-signals-make-a-domain-name-valuable",
    ],
  },
  {
    slug: HISTORY_SLUG,
    question: "How to check a used domain's history before you buy it",
    metaTitle: "How to Check a Used or Expired Domain's History Before You Buy",
    metaDescription:
      "A six-check audit for a previously used or expired domain: Wayback Machine snapshots, registration data, backlinks, blocklists, Google manual actions and trademarks, with a worked example.",
    answer:
      "Run six checks before you pay: read what the domain hosted in the Wayback Machine, look up its registration record in ICANN Lookup, review who links to it, test it against Google Safe Browsing and the Spamhaus Domain Blocklist, search the trademark register for the name, and check Search Console for manual actions as soon as you can verify it. A used domain is worth buying when its past content and links fit what you'll do with it and none of the checks turns up spam, malware or a brand that is still active.",
    datePublished: PUBLISHED,
    dateModified: REVISED,
    framework: {
      heading: "The six checks",
      intro: "Do them in this order. The first two take minutes and often settle the question on their own.",
      criteria: [
        {
          name: "1. Past content",
          check: "Open the Wayback Machine calendar for the domain and read at least one capture from every year it was live. Note changes of topic, language or owner, and any period when it redirected somewhere else.",
          inApp: "Not scored. The scores read the name only.",
        },
        {
          name: "2. Registration record",
          check: "ICANN Lookup shows the creation and expiry dates, the registrar and status codes. A corporate brand-protection registrar or 'transfer prohibited' locks mean the name is being held on purpose.",
          inApp: "Not checked.",
        },
        {
          name: "3. Backlink profile",
          check: "In a backlink tool, note the referring domains, what the linking sites are about and the anchor text. Links from your field are an asset; casino, pharma or foreign-language anchors are a cleanup job.",
          inApp: "Not checked.",
        },
        {
          name: "4. Blocklists",
          check: "Look the domain up in Google Safe Browsing site status and on Spamhaus. A listing means browsers or mail filters may already block it.",
          inApp: "Not checked.",
        },
        {
          name: "5. Manual actions",
          check: "The Manual actions report is only visible to verified owners in Search Console. Ask the seller for a screenshot, or verify the domain the day it transfers.",
          inApp: "Not checked.",
        },
        {
          name: "6. Trademark",
          check: "Search the trademark register for the name in your class. A past owner that was a real business may still hold the mark after letting the domain go.",
          inApp: "Not checked.",
        },
      ],
    },
    signalsHeading: "Why the name scores can't see a domain's past",
    signalNotes: [
      { key: "trust", note: "Reflects how familiar the extension is, not the domain's reputation: a .com with a spam past still scores 100, which is why this audit exists." },
      { key: "resale", note: "Is structural and blind to links and history, so a clean audit with strong, relevant links can make a used name worth more than its score suggests." },
    ],
    table: {
      heading: "Red-flag thresholds",
      caption: "How to read each check. One 'walk away' result is enough to stop, whatever the price.",
      columns: ["Check", "Fine", "Investigate", "Walk away"],
      rows: [
        ["Past content", "Same or neighbouring topic, or parked only", "An unrelated but legitimate business", "Pharma, casino, adult, scraped or auto-generated pages, or a sudden switch of language"],
        ["Backlinks", "Mostly from sites in your field, natural anchors", "Many links from one network, or sitewide footer links", "Most anchors unrelated to the site's past topic, or obvious link farms"],
        ["Moz Spam Score", "1–30% (Moz calls this low)", "31–60%", "61% or higher"],
        ["Safe Browsing / Spamhaus", "Not listed", "Listed in the past, now clear", "Listed now; make delisting a condition of sale"],
        ["Manual actions", "None", "Resolved in the past", "An active manual action"],
        ["Trademark", "No live mark in your class", "A live mark in another class", "A live mark in your class"],
      ],
    },
    example: {
      heading: "Worked example: auditing brightnest.com",
      intro:
        "brightnest.com is the demo name the search shows as taken. Here is what each check returned when we ran it on 5 November 2026.",
      table: {
        heading: "brightnest.com audit results",
        caption: "Checked 5 November 2026. Wayback dates are capture dates, so changes happened on or before them.",
        columns: ["Check", "What we found", "What it means"],
        rows: [
          [
            "Wayback Machine",
            "First capture 8 May 2011, titled \"BrightNest | A website that makes it easy to be a good homeowner\". From 2014 to a capture on 12 December 2019 the title was \"BrightNest | The Brighter Side of Home Maintenance\". By 2 January 2020 it redirected to angieslist.com/brightnest/, and by September 2023 to angi.com.",
            "A genuine home-maintenance publisher that was folded into a larger home-services brand. Topically clean, but acquired rather than abandoned.",
          ],
          [
            "ICANN Lookup (RDAP)",
            "Created 20 April 2011, expires 20 April 2027. Registrar Lexsynergy Limited. Status: client delete, transfer and update prohibited.",
            "Locked and renewed through a corporate registrar: held deliberately and not about to drop.",
          ],
          [
            "Live response",
            "Both http and https return a 301 redirect to https://www.angi.com/.",
            "The owner uses it to pass visitors and link equity to its main site.",
          ],
          [
            "Backlinks (Moz, crawled 27 Oct 2026)",
            "3,859 referring root domains and 18,397 linking pages to the root domain. Domain Authority 60, Spam Score 5%.",
            "A strong, low-spam profile, which is exactly why the owner keeps the redirect in place.",
          ],
          [
            "Google Safe Browsing",
            "No unsafe content found.",
            "Clean.",
          ],
          [
            "Spamhaus Domain Blocklist",
            "Not listed (the DNS lookup returned no record; the test domain did).",
            "Clean.",
          ],
          [
            "Manual actions and trademark",
            "Not run: manual actions need the owner's Search Console, and the trademark search depends on your class.",
            "With an active owner redirecting it, assume any brand rights sit with them.",
          ],
        ],
      },
      verdict:
        "Verdict: a clean history, but not a purchase. Every check points to a name kept as part of an active brand, so the realistic move is a different name rather than an offer. Had the same history turned up on a domain listed for sale, its relevant links and clean record would make it a strong candidate for a home-services business.",
    },
    whenNotHeading: "When you can skip most of the history audit",
    whenNot: [
      "When the Wayback Machine has no captures and a backlink tool finds no referring domains. There is no history to audit; just run the trademark search.",
      "When you're buying a misspelling only to redirect it to your main site. Check the blocklists and skip the deep link review.",
      "When the name already fails your shortlist for other reasons. Don't spend an hour auditing a name you wouldn't use.",
    ],
    mistakesHeading: "Audit mistakes",
    mistakes: [
      "Reading only the latest Wayback capture. Problems tend to sit in the gap between two owners.",
      "Counting referring domains without opening any. A thousand links from one network are worth less than twenty from your field.",
      "Treating a high Domain Authority as proof of quality. It measures link strength, not topic fit or spam.",
      "Paying before the transfer is confirmed, then finding the domain locked at a corporate registrar.",
    ],
    nextStep: {
      text: "Score names first so you only audit finalists. Taken names stay visible as benchmarks next to buyable alternatives, so you can see what walking away from a name would cost.",
      links: [SEARCH_CTA, { href: "/guides/alternatives-when-the-domain-name-you-want-is-taken", label: "Decide whether to buy or rename" }],
    },
    faqs: [
      {
        q: "How far back should I look in the Wayback Machine?",
        a: "Every year the domain resolved. Spam often sits in a short window between two legitimate owners, so skim one capture per year and read closely around any change of title, language or redirect target.",
      },
      {
        q: "Do old backlinks still help after a domain changes hands?",
        a: "They can, if the new site continues the same subject. Google's spam policies name 'expired domain abuse': buying an expired domain and repurposing it mainly to manipulate rankings with low-value content. Links help a site that genuinely carries on the topic, not one built to exploit them.",
      },
      {
        q: "Can I see a domain's Google manual actions before I buy it?",
        a: "Not on your own. The Manual actions report is only visible to verified owners in Search Console. Ask the seller for a screenshot or temporary access; if they can't provide it, treat the status as unknown and check the day the domain transfers.",
      },
      {
        q: "What should I do if a domain I bought is on a blocklist?",
        a: "Use the blocklist's lookup page to find out why it was listed, remove the cause, then follow that list's delisting process. For Google Safe Browsing, fix the issue and request a review from the Security issues report in Search Console.",
      },
    ],
    sources: [WAYBACK, ICANN_LOOKUP, GOOGLE_SPAM_POLICIES, GOOGLE_MANUAL_ACTIONS, SAFE_BROWSING, SPAMHAUS, MOZ_SPAM_SCORE, USPTO_SEARCH],
    related: [
      "what-signals-make-a-domain-name-valuable",
      "alternatives-when-the-domain-name-you-want-is-taken",
      "how-to-shortlist-domain-names-for-a-new-company",
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

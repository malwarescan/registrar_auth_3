#!/usr/bin/env bash
# QA smoke tests for /api/analyze
set -euo pipefail
BASE="${1:-http://localhost:3000}"
PASS=0
FAIL=0

check() {
  local name="$1"
  local expect="$2"
  local body="$3"
  local res
  res=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/analyze" \
    -H "Content-Type: application/json" \
    -d "$body")
  local code
  code=$(echo "$res" | tail -1)
  local json
  json=$(echo "$res" | sed '$d')

  if eval "$expect"; then
    echo "PASS: $name (HTTP $code)"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $name (HTTP $code)"
    echo "  Response: $(echo "$json" | head -c 300)"
    FAIL=$((FAIL + 1))
  fi
}

BRIEF_BASE='"searchMode":"business_idea","industry":"","audience":"","location":"","productService":"","currentDomain":"","competitors":"","personalName":"","profession":"","marketScope":"","brandTones":[],"marketingChannels":[],"seoGoals":[],"aiGoals":[],"trustRequirements":[],"requirements":[],"maxPrice":5000,"tldPreference":"com","buyNowOnly":false,"premiumAllowed":true,"resaleImportance":false,"priorityWeights":{"brand":2,"seo":1,"ai":1,"trust":2,"value":1,"resale":0.5}'

echo "=== QA: $BASE ==="

# 1. Missing intent
check "reject missing intent" '[ "$code" = "400" ]' \
  '{"brief":{"naming":"test company","buyingIntent":null,'"$BRIEF_BASE"'}}'

# 2. Missing naming
check "reject empty naming" '[ "$code" = "400" ]' \
  '{"brief":{"naming":"","buyingIntent":"business_brand","searchGoal":"business_brand",'"$BRIEF_BASE"'}}'

# 3. Home security business brand
check "home security brandable" '[ "$code" = "200" ] && echo "$json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get(\"results\",[])
assert len(r)>0, \"no results\"
literal=[x for x in r if \"homesecuritysystem\" in x[\"domain\"].replace(\"-\",\"\")]
assert not literal, f\"literal keyword domain found: {literal}\"
avail=[x for x in r if x.get(\"availabilityStatus\")==\"available\"]
assert len(avail)>0, \"no available domains\"
assert d.get(\"apiConfigured\"), \"api not configured\"
print(f\"  {len(r)} results, {len(avail)} available\")
"' \
  '{"brief":{"naming":"Home security system company","buyingIntent":"business_brand","searchGoal":"business_brand","industry":"Home security","audience":"Homeowners","brandTones":["Trustworthy"],"requirements":["brandable",".com preferred"],'"$BRIEF_BASE"'}}'

# 4. SEO content allows keyword-style
check "seo content keyword ok" '[ "$code" = "200" ] && echo "$json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get(\"results\",[])
assert len(r)>0
print(f\"  top: {r[0][\"domain\"]}\")
"' \
  '{"brief":{"naming":"home security reviews and guides","buyingIntent":"seo_content","searchGoal":"seo_content","industry":"Home security","requirements":["exact match"],'"$BRIEF_BASE"'}}'

# 5. Local service
check "local service with location" '[ "$code" = "200" ] && echo "$json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get(\"results\",[])
assert len(r)>0
print(f\"  top: {r[0][\"domain\"]}\")
"' \
  '{"brief":{"naming":"Premium landscaping company","buyingIntent":"local_service","searchGoal":"local_service","productService":"Landscaping","location":"Austin","requirements":["local SEO"],'"$BRIEF_BASE"'}}'

# 6. All results have availabilityStatus
check "availabilityStatus on all" '[ "$code" = "200" ] && echo "$json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for r in d.get(\"results\",[]):
  assert \"availabilityStatus\" in r, r.get(\"domain\")
  assert r[\"availabilityStatus\"] in (\"available\",\"premium\",\"taken\",\"idea_only\")
print(\"  all have valid status\")
"' \
  '{"brief":{"naming":"AI real estate assistant","buyingIntent":"saas_app","searchGoal":"saas_app","industry":"PropTech",'"$BRIEF_BASE"'}}'

# 7. Decision stack present
check "decision stack" '[ "$code" = "200" ] && echo "$json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
ds=d.get(\"decisionStack\")
assert ds and ds.get(\"brand\") and ds.get(\"seo\")
print(f\"  brand={ds[\"brand\"][\"domain\"]} seo={ds[\"seo\"][\"domain\"]}\")
"' \
  '{"brief":{"naming":"Eco home technology SaaS","buyingIntent":"saas_app","searchGoal":"saas_app",'"$BRIEF_BASE"'}}'

# 8. Pizza parlour — business-style local names, not raw SEO slugs
check "pizza parlour local service" '[ "$code" = "200" ] && echo "$json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get(\"results\",[])
assert len(r)>0, \"no results\"
label=r[0][\"domain\"].split(\".\")[0].replace(\"-\",\"\").lower()
assert \"pasadena\" in label and \"pizza\" in label, f\"expected pasadena+pizza, got {r[0][\"domain\"]}\"
assert label not in (\"pizzapasadena\",\"pasadenapizza\"), f\"raw SEO slug won: {r[0][\"domain\"]}\"
assert r[0].get(\"availabilityStatus\") in (\"available\",\"premium\"), r[0]
print(f\"  top: {r[0][\"domain\"]}\")
"' \
  '{"brief":{"naming":"Pizza parlour in pasadena ca","buyingIntent":"local_service","searchGoal":"local_service","productService":"","location":"","requirements":[],'"$BRIEF_BASE"'}}'

# 9. Business brand + local pizza description — must stay on-subject
check "business brand pizza pasadena" '[ "$code" = "200" ] && echo "$json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
r=d.get(\"results\",[])
assert len(r)>0
top=r[0][\"domain\"].replace(\"-\",\"\").lower()
assert \"pizza\" in top and \"pasadena\" in top, f\"off-topic top: {r[0][\"domain\"]}\"
generic=[x for x in r if any(x[\"domain\"].startswith(g) for g in (\"primepilot\",\"novahaven\",\"corenest\"))]
assert not generic, f\"generic fallback leaked: {generic[:3]}\"
print(f\"  top: {r[0][\"domain\"]}\")
"' \
  '{"brief":{"naming":"pizza parlour in pasadena ca","buyingIntent":"business_brand","searchGoal":"business_brand",'"$BRIEF_BASE"'}}'

echo ""
echo "Results: $PASS passed, $FAIL failed"
exit $FAIL

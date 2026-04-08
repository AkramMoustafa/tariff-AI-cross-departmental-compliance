from src.api.sanctions import (
    load_sanctions,
    get_sanctions_entities,
    sanctions_health,
    build_country_sanction_scores
)

# Step 1: Load data
load_sanctions()

# Step 2: Check health
print("\n=== HEALTH ===")
print(sanctions_health())

# Step 3: Get entities
entities = get_sanctions_entities()

print("\n=== BASIC INFO ===")
print("Total entities:", len(entities))

# Step 4: Print first 5
print("\n=== SAMPLE ENTITIES ===")
for i, e in enumerate(entities[:5]):
    print(f"\nEntity {i+1}:")
    print(e)

    

print("\n=== BUILDING COUNTRY SANCTION SCORES ===")
scores = build_country_sanction_scores()

print("\nTotal countries:", len(scores))

print("\n=== SAMPLE SCORES ===")
for k, v in list(scores.items())[:10]:
    print(k, ":", round(v, 3))

print("\n=== TOP 10 COUNTRIES ===")
top = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:10]
for c, s in top:
    print(c, ":", round(s, 3))




print("\n=== VALIDATION CHECKS ===")

# Check score range
min_score = min(scores.values())
max_score = max(scores.values())

print("Min score:", round(min_score, 3))
print("Max score:", round(max_score, 3))

# Check if any weird keys
weird = [k for k in scores.keys() if k is None or k == ""]
print("Weird country entries:", weird[:5])

# Check if expected countries exist
expected = ["Cuba", "Iran", "Russia"]
for c in expected:
    print(f"{c} present:", c in scores)
from src.api.New1.loader import resolve_to_10_digit
import src.api.New1.tariffmodel as tariffmodel

hs_tree = tariffmodel.HS_TREE

query = input("Enter product description: ")

results = resolve_to_10_digit(query, hs_tree)

print("\nRESULTS:\n")

if not results:
    print("No results found")
else:
    for r in results:
        print("HS Code:", r["hs_code"])
        print("Description:", r["description"])
        print("Score:", r["score"])

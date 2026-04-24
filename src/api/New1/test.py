from src.api.New1.loader import resolve_to_10_digit
from src.api.New1.loader import load_hs_tree
from src.api.New1.loader import improve_description_llm

hs_tree = load_hs_tree()

query = input("Enter product description: ")

# ✅ LLM runs on original input
clean_desc = improve_description_llm(query)

results = resolve_to_10_digit(query, hs_tree)

print("\nAI IMPROVED DESCRIPTION:\n")
print(clean_desc)

print("\nRESULTS:\n")

if not results:
    print("No results found")
else:
    for r in results:
        print("HS Code:", r["hs_code"])
        print("HS Description:", r["description"])  # HS hierarchy
        print("Score:", r["score"])
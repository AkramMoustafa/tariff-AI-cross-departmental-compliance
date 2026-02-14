import json
from src.api.New.embeddings import embed

INTENT_TEXTS = {
    "apparel": "clothing garments jacket coat shirt trousers apparel fashion",
    "raw_material": "raw material unprocessed bulk commodity leather steel cotton chemical compound",
    "machinery": "machine mechanical equipment industrial device engine pump motor",
    "electronics": "electronic device circuit semiconductor battery electrical equipment",
    "food": "food edible meat dairy fruit vegetables agricultural product",
}

def generate():
    vectors = {}

    for name, text in INTENT_TEXTS.items():
        print(f"Embedding intent: {name}")
        vectors[name] = embed(text)

    with open("intent_vectors.json", "w") as f:
        json.dump(vectors, f)

    print("Intent vectors saved to intent_vectors.json")

if __name__ == "__main__":
    generate()

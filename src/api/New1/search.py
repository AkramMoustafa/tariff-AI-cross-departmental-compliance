import json
import numpy as np

with open("intent_vectors.json") as f:
    INTENT_ANCHORS = json.load(f)

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def detect_intent(query_embedding):
    best_intent = None
    best_score = -1

    for intent, anchor_vec in INTENT_ANCHORS.items():
        score = cosine_similarity(query_embedding, anchor_vec)
        if score > best_score:
            best_score = score
            best_intent = intent

    return best_intent

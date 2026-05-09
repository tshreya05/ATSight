from __future__ import annotations

from functools import lru_cache
from typing import Iterable

from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


@lru_cache(maxsize=1)
def _model() -> SentenceTransformer:
    return SentenceTransformer("all-MiniLM-L6-v2")


def semantic_similarity(a: str, b: str) -> float:
    emb = _model().encode([a, b])
    score = cosine_similarity([emb[0]], [emb[1]])[0][0]
    return round(float(score), 4)


def tfidf_similarity(a: str, b: str) -> float:
    vec = TfidfVectorizer(stop_words="english")
    matrix = vec.fit_transform([a, b])
    score = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
    return round(float(score), 4)


def overlap_ratio(items_a: Iterable[str], items_b: Iterable[str]) -> float:
    a = {x.lower().strip() for x in items_a if x}
    b = {x.lower().strip() for x in items_b if x}
    if not b:
        return 0.0
    return len(a.intersection(b)) / len(b)

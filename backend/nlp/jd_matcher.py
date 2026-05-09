from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def calculate_jd_similarity(resume_text: str, jd_text: str) -> float:
    """
    Calculates cosine similarity between resume and job description.
    Returns a score between 0 and 1.
    """

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume_text, jd_text])

    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    return round(float(similarity), 3)

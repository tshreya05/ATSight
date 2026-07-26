import re

STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "with",
}

def preprocess_text(text: str) -> str:
    """
    Cleans and preprocesses resume text for NLP tasks.
    """

    # 1. Lowercase
    text = text.lower()

    # 2. Remove special characters & numbers
    text = re.sub(r"[^a-z\s]", " ", text)

    # 3. Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    # 4. Light normalization + stopword removal
    cleaned_tokens = [token for token in text.split() if token not in STOP_WORDS and len(token) > 2]

    return " ".join(cleaned_tokens)

import pdfplumber

def extract_text_from_pdf(file):
    """
    Extracts text for NLP and word-level coordinates for frontend highlighting.
    Returns: (full_text, word_map)
    """
    full_text = ""
    word_map = [] # List of {text, x, y, w, h, page}

    with pdfplumber.open(file) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"
            
            # Extract word-level coordinates for highlighting
            words = page.extract_words()
            for w in words:
                word_map.append({
                    "text": w['text'],
                    "x": float(w['x0']),
                    "y": float(w['top']),
                    "w": float(w['x1'] - w['x0']),
                    "h": float(w['bottom'] - w['top']),
                    "page": i + 1
                })
                
    return full_text.strip(), word_map
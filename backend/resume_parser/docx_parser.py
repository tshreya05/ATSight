from docx import Document
from io import BytesIO

def extract_text_from_docx(file):
    # Read uploaded file into memory
    file_bytes = file.read()

    # Convert to BytesIO so python-docx can read it
    doc = Document(BytesIO(file_bytes))

    text = []
    for para in doc.paragraphs:
        if para.text.strip():
            text.append(para.text.strip())

    return "\n".join(text)

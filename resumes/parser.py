import fitz  # PyMuPDF

def extract_text_from_pdf(pdf_path):
    try:
        text = ""
        document = fitz.open(pdf_path)
        for page in document:
            # Add newline to prevent word merging
            text += page.get_text("text") + "\n" 
        document.close()
        
        # Clean extra whitespace
        cleaned_text = " ".join(text.split())
        return cleaned_text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF {pdf_path}: {e}")
        return ""
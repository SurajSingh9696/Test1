#!/usr/bin/env python3
"""
Document to PDF converter using various Python libraries.
Usage: python doc_to_pdf.py <input_file> <output_pdf>
Supports: DOCX, TXT, HTML
"""

import sys
from pathlib import Path

def docx_to_pdf(docx_path, pdf_path):
    """Convert DOCX to PDF using python-docx and reportlab."""
    try:
        from docx import Document
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.units import inch
        
        doc = Document(docx_path)
        pdf = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        for para in doc.paragraphs:
            if para.text.strip():
                # Escape special characters for reportlab
                text = para.text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                story.append(Paragraph(text, styles['Normal']))
                story.append(Spacer(1, 0.1 * inch))
        
        if not story:
            story.append(Paragraph("(Empty document)", styles['Normal']))
        
        pdf.build(story)
        print(f"Successfully converted {docx_path} to {pdf_path}")
        return True
        
    except Exception as e:
        print(f"Error converting DOCX to PDF: {e}", file=sys.stderr)
        return False

def txt_to_pdf(txt_path, pdf_path):
    """Convert TXT to PDF using reportlab."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        
        c = canvas.Canvas(pdf_path, pagesize=letter)
        width, height = letter
        
        with open(txt_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        y = height - 50
        for line in lines:
            if y < 50:
                c.showPage()
                y = height - 50
            c.drawString(50, y, line.rstrip()[:100])  # Limit line length
            y -= 14
        
        c.save()
        print(f"Successfully converted {txt_path} to {pdf_path}")
        return True
        
    except Exception as e:
        print(f"Error converting TXT to PDF: {e}", file=sys.stderr)
        return False

def html_to_pdf(html_path, pdf_path):
    """Convert HTML to PDF using weasyprint or fallback to basic method."""
    try:
        # Try weasyprint first (if installed)
        from weasyprint import HTML
        HTML(html_path).write_pdf(pdf_path)
        print(f"Successfully converted {html_path} to {pdf_path}")
        return True
    except ImportError:
        # Fallback: read HTML as text and convert
        return txt_to_pdf(html_path, pdf_path)
    except Exception as e:
        print(f"Error converting HTML to PDF: {e}", file=sys.stderr)
        return False

def convert_to_pdf(input_path, output_path):
    """Route to appropriate converter based on input file extension."""
    ext = Path(input_path).suffix.lower()
    
    if ext in ['.docx']:
        return docx_to_pdf(input_path, output_path)
    elif ext in ['.txt']:
        return txt_to_pdf(input_path, output_path)
    elif ext in ['.html', '.htm']:
        return html_to_pdf(input_path, output_path)
    else:
        print(f"Unsupported input format: {ext}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python doc_to_pdf.py <input_file> <output_pdf>", file=sys.stderr)
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_pdf = sys.argv[2]
    
    success = convert_to_pdf(input_file, output_pdf)
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
PDF to Image converter using pdf2image (poppler).
Usage: python pdf_to_image.py <input_pdf> <output_dir> <format> [page]
"""

import sys
import os
from pathlib import Path

def convert_pdf_to_images(pdf_path, output_dir, output_format='png', page=None):
    """Convert PDF pages to images."""
    try:
        from pdf2image import convert_from_path
        
        # Convert PDF to images
        print(f"Converting PDF to {output_format}...")
        
        dpi = 150
        if page:
            # Convert specific page (1-indexed)
            images = convert_from_path(pdf_path, dpi=dpi, first_page=int(page), last_page=int(page))
        else:
            # Convert all pages
            images = convert_from_path(pdf_path, dpi=dpi)
        
        if not images:
            print("No pages found in PDF", file=sys.stderr)
            return []
        
        base_name = Path(pdf_path).stem
        timestamp = int(__import__('time').time() * 1000)
        output_files = []
        
        fmt = 'JPEG' if output_format.lower() in ['jpg', 'jpeg'] else output_format.upper()
        ext = 'jpg' if output_format.lower() in ['jpg', 'jpeg'] else output_format.lower()
        
        for i, image in enumerate(images):
            page_num = page if page else (i + 1)
            output_path = os.path.join(output_dir, f"{base_name}_{timestamp}_page{page_num}.{ext}")
            image.save(output_path, fmt)
            output_files.append(output_path)
            print(f"Saved: {output_path}")
        
        print(f"Successfully converted {len(output_files)} page(s)")
        return output_files
        
    except ImportError as e:
        print(f"Missing required library: {e}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Error converting PDF to images: {e}", file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python pdf_to_image.py <input_pdf> <output_dir> <format> [page]", file=sys.stderr)
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    output_dir = sys.argv[2]
    output_format = sys.argv[3]
    page = sys.argv[4] if len(sys.argv) > 4 else None
    
    files = convert_pdf_to_images(input_pdf, output_dir, output_format, page)
    
    if files:
        # Print output files as newline-separated list (for Node.js to parse)
        for f in files:
            print(f"OUTPUT:{f}")
        sys.exit(0)
    else:
        sys.exit(1)

#!/usr/bin/env python3
"""
PDF to Excel/CSV converter using pdfplumber (primary) or tabula-py (fallback).
Extracts tables from PDF and saves as XLSX or CSV.
Usage: python pdf_to_excel.py <input_pdf> <output_xlsx_or_csv>
"""

import sys
import pandas as pd
from pathlib import Path

def extract_tables_with_pdfplumber(pdf_path):
    """Extract tables using pdfplumber (pure Python, no Java)."""
    try:
        import pdfplumber
        tables = []
        
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_tables = page.extract_tables()
                for table in page_tables:
                    if table and len(table) > 0:
                        # Convert to DataFrame, using first row as header if it looks like headers
                        df = pd.DataFrame(table[1:], columns=table[0])
                        tables.append(df)
        
        print(f"pdfplumber extracted {len(tables)} table(s)")
        return tables
    except ImportError:
        print("pdfplumber not available, falling back to tabula", file=sys.stderr)
        return None
    except Exception as e:
        print(f"pdfplumber error: {e}, trying tabula", file=sys.stderr)
        return None

def extract_tables_with_tabula(pdf_path):
    """Extract tables using tabula-py (requires Java)."""
    try:
        import tabula
        tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
        print(f"tabula extracted {len(tables)} table(s)")
        return tables
    except Exception as e:
        print(f"tabula error: {e}", file=sys.stderr)
        return None

def convert_pdf_to_excel(pdf_path, output_path):
    """Extract tables from PDF and save as Excel or CSV."""
    try:
        # Try pdfplumber first (no Java required), then tabula as fallback
        tables = extract_tables_with_pdfplumber(pdf_path)
        
        if tables is None:
            tables = extract_tables_with_tabula(pdf_path)
        
        if not tables or len(tables) == 0:
            print("No tables found in PDF. Creating empty file.", file=sys.stderr)
            tables = [pd.DataFrame()]
        
        output_ext = Path(output_path).suffix.lower()
        
        if output_ext == '.xlsx':
            # Save all tables to different sheets in Excel
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                for i, table in enumerate(tables):
                    sheet_name = f'Table_{i+1}' if len(tables) > 1 else 'Sheet1'
                    table.to_excel(writer, sheet_name=sheet_name, index=False)
        elif output_ext == '.csv':
            # For CSV, concatenate all tables
            combined = pd.concat(tables, ignore_index=True)
            combined.to_csv(output_path, index=False)
        else:
            print(f"Unsupported output format: {output_ext}", file=sys.stderr)
            return False
        
        print(f"Successfully extracted {len(tables)} table(s) from {pdf_path} to {output_path}")
        return True
        
    except Exception as e:
        print(f"Error extracting tables from PDF: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python pdf_to_excel.py <input_pdf> <output_xlsx_or_csv>", file=sys.stderr)
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    output_file = sys.argv[2]
    
    success = convert_pdf_to_excel(input_pdf, output_file)
    sys.exit(0 if success else 1)


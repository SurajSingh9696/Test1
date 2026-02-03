#!/usr/bin/env python3
"""
PDF to Excel/CSV converter using tabula-py library.
Extracts tables from PDF and saves as XLSX or CSV.
Usage: python pdf_to_excel.py <input_pdf> <output_xlsx_or_csv>
"""

import sys
import tabula
import pandas as pd
from pathlib import Path

def convert_pdf_to_excel(pdf_path, output_path):
    """Extract tables from PDF and save as Excel or CSV."""
    try:
        # Read all tables from PDF
        tables = tabula.read_pdf(pdf_path, pages='all', multiple_tables=True)
        
        if not tables or len(tables) == 0:
            print("No tables found in PDF. Creating empty file.", file=sys.stderr)
            # Create empty dataframe if no tables found
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

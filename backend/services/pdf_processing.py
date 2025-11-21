from pypdf import PdfWriter, PdfReader
import io
from typing import List

def merge_pdfs(files: List[bytes]) -> io.BytesIO:
    """
    Merge multiple PDF files into a single PDF.
    """
    try:
        writer = PdfWriter()

        for file_content in files:
            reader = PdfReader(io.BytesIO(file_content))
            for page in reader.pages:
                writer.add_page(page)

        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        return output
    except Exception as e:
        raise ValueError(f"PDF merge failed: {str(e)}")

def extract_pages(file_content: bytes, page_range: str) -> io.BytesIO:
    """
    Extract specific pages from a PDF.
    page_range format: "1,3-5,7" (1-based indexing from user, converted to 0-based)
    """
    try:
        reader = PdfReader(io.BytesIO(file_content))
        writer = PdfWriter()
        total_pages = len(reader.pages)

        # Parse page range
        pages_to_extract = set()
        parts = page_range.split(',')

        for part in parts:
            part = part.strip()
            if '-' in part:
                start, end = map(int, part.split('-'))
                # Convert to 0-based, handle bounds
                start = max(1, start)
                end = min(total_pages, end)
                for i in range(start - 1, end):
                    pages_to_extract.add(i)
            else:
                page_num = int(part)
                if 1 <= page_num <= total_pages:
                    pages_to_extract.add(page_num - 1)

        sorted_pages = sorted(list(pages_to_extract))

        if not sorted_pages:
            raise ValueError("No valid pages selected")

        for page_idx in sorted_pages:
            writer.add_page(reader.pages[page_idx])

        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        return output
    except ValueError as ve:
        raise ve
    except Exception as e:
        raise ValueError(f"PDF extraction failed: {str(e)}")

def rotate_pdf_pages(file_content: bytes, rotation_angle: int) -> io.BytesIO:
    """
    Rotate all pages of a PDF by a specified angle (90, 180, 270 degrees).
    """
    try:
        if rotation_angle not in [90, 180, 270]:
            raise ValueError("Rotation angle must be 90, 180, or 270 degrees.")

        reader = PdfReader(io.BytesIO(file_content))
        writer = PdfWriter()

        for page in reader.pages:
            page.rotate(rotation_angle)
            writer.add_page(page)

        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        return output
    except Exception as e:
        raise ValueError(f"PDF rotation failed: {str(e)}")
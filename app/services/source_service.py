import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.config import settings


ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".html", ".pptx", ".md"}


def save_upload(file: UploadFile) -> tuple[str, str, int]:
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}")

    file_id = uuid4().hex
    safe_name = f"{file_id}{ext}"
    upload_dir = settings.BASE_DIR / settings.UPLOAD_DIR
    upload_dir.mkdir(parents=True, exist_ok=True)
    dest = upload_dir / safe_name

    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    file_size = dest.stat().st_size
    rel_path = f"{settings.UPLOAD_DIR}/{safe_name}"
    return rel_path, file.filename, file_size


def extract_text(file_path: str) -> str:
    full_path = settings.BASE_DIR / file_path
    ext = full_path.suffix.lower()

    if ext in (".txt", ".md"):
        return full_path.read_text(encoding="utf-8", errors="replace")

    if ext == ".html":
        from html.parser import HTMLParser
        class TextExtractor(HTMLParser):
            def __init__(self):
                super().__init__()
                self.parts = []
            def handle_data(self, data):
                self.parts.append(data)
        parser = TextExtractor()
        parser.feed(full_path.read_text(encoding="utf-8", errors="replace"))
        return " ".join(parser.parts)

    try:
        return _extract_with_pymupdf(full_path)
    except ImportError:
        pass
    except Exception:
        pass

    try:
        return _extract_with_docling(full_path)
    except Exception as e:
        return f"[Text extraction failed: {e}]"


def _extract_with_pymupdf(path: Path) -> str:
    import pymupdf
    doc = pymupdf.open(str(path))
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text())
    doc.close()
    text = "\n".join(text_parts).strip()
    text = text.replace("\x00", "")
    if not text:
        raise ValueError("No text extracted")
    return text


def _extract_with_docling(path: Path) -> str:
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.pipeline_options import PdfPipelineOptions
    from docling.datamodel.base_models import InputFormat

    pipeline_options = PdfPipelineOptions(do_ocr=False)
    converter = DocumentConverter(
        format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)}
    )
    result = converter.convert(str(path))
    return result.document.export_to_markdown()


def delete_upload(file_path: str | None) -> None:
    if not file_path:
        return
    full_path = settings.BASE_DIR / file_path
    if full_path.exists():
        full_path.unlink()

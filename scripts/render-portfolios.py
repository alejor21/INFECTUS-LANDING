"""Build lightweight reading pages from the original PDFs; originals stay untouched."""
from pathlib import Path
import json
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
for key, filename in (
    ("vaccine", "INFECTUS_VACCINE_Portafolio_Vacunacion_2026.pdf"),
    ("services", "Portafolio_Infectus_Opcion1.pdf"),
):
    document = pdfium.PdfDocument(str(ROOT / "assets" / "PDFS" / filename))
    target = ROOT / "public" / "pdfs" / "previews" / key
    target.mkdir(parents=True, exist_ok=True)
    pages = []
    for index in range(len(document)):
        page = document[index]
        bitmap = page.render(scale=1400 / page.get_width())
        image = bitmap.to_pil()
        filename = f"page-{index + 1}.webp"
        image.save(target / filename, "WEBP", quality=85, method=6)
        textpage = page.get_textpage()
        pages.append({"src": filename, "width": image.width, "height": image.height,
                      "text": textpage.get_text_range()})
        textpage.close()
        image.close()
        bitmap.close()
        page.close()
    (target / "pages.json").write_text(json.dumps(pages, ensure_ascii=False), encoding="utf-8")
    document.close()
    print(f"{key}: {len(pages)} pages")

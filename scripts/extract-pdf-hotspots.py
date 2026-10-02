"""Add the interactive layer of each PDF to its pages.json.

The web reader shows each page as an image; this script records where the PDF's
links and form fields sit so the reader can recreate them on top of the image:
internal links (go to page), external links (WhatsApp, email) and form fields.
Coordinates are stored as fractions of the page (0..1, origin top-left).

Run after scripts/render-portfolios.py. Requires: pip install pypdf
"""
from pathlib import Path
import json
import pypdf

ROOT = Path(__file__).resolve().parents[1]

# Labels for the quote form on the vaccination portfolio, as printed on page 30.
FIELD_LABELS = {
    "empresa": "Nombre o razón social",
    "nit": "NIT o documento",
    "contacto": "Persona de contacto",
    "tel": "Teléfono o WhatsApp",
    "ciudad": "Ciudad o municipio",
    "personas": "Número de personas a vacunar",
    "v_hexaxim": "HEXAXIM",
    "v_pentaxim": "PENTAXIM",
    "v_rotateq": "ROTATEQ",
    "v_prevenar13": "PREVENAR 13",
    "v_vaxneuvance": "VAXNEUVANCE 15",
    "v_pneumo23": "PNEUMO 23",
    "v_priorix": "PRIORIX",
    "v_proquad": "PROQUAD",
    "v_varivax": "VARIVAX",
    "v_elovac": "ELOVAC B",
    "v_avaxim-ped": "AVAXIM 80 PEDIÁTRICO",
    "v_avaxim-adulto": "AVAXIM 160 ADULTO",
    "v_gardasil9": "GARDASIL 9",
    "v_adacel": "ADACEL",
    "v_tetavax": "TETAVAX",
    "v_antitetanica": "VA-ANTITETÁNICA",
    "v_stamaril": "STAMARIL",
    "v_typhim": "TYPHIM Vi",
    "v_verorab": "VERORAB",
    "v_shingrix": "SHINGRIX",
}


def field_label(name):
    if name in FIELD_LABELS:
        return FIELD_LABELS[name]
    return name.removeprefix("v_").replace("-", " ").upper()


def inherited(annotation, key):
    """Form keys such as /T and /FT may live on the parent field."""
    node = annotation
    while node is not None:
        if key in node:
            return node[key]
        parent = node.get("/Parent")
        node = parent.get_object() if parent is not None else None
    return None


def destination_page(reader, dest):
    if dest is None:
        return None
    if isinstance(dest, (pypdf.generic.TextStringObject, pypdf.generic.NameObject, str)):
        named = reader.named_destinations.get(str(dest))
        return reader.get_destination_page_number(named) if named else None
    if isinstance(dest, pypdf.generic.ArrayObject) and dest:
        return reader.get_page_number(dest[0].get_object())
    return None


def box(rect, width, height):
    x0, y0, x1, y1 = (float(value) for value in rect)
    left, right = sorted((x0, x1))
    bottom, top = sorted((y0, y1))
    return [round(left / width, 4), round((height - top) / height, 4),
            round((right - left) / width, 4), round((top - bottom) / height, 4)]


for key, filename in (
    ("vaccine", "INFECTUS_VACCINE_Portafolio_Vacunacion_2026.pdf"),
    ("services", "Portafolio_Infectus_Opcion1.pdf"),
):
    reader = pypdf.PdfReader(str(ROOT / "public" / "pdfs" / filename))
    manifest = ROOT / "public" / "pdfs" / "previews" / key / "pages.json"
    pages = json.loads(manifest.read_text(encoding="utf-8"))
    total = 0
    for index, page in enumerate(reader.pages):
        width, height = float(page.mediabox.width), float(page.mediabox.height)
        spots = []
        for ref in page.get("/Annots") or []:
            annotation = ref.get_object()
            subtype = annotation.get("/Subtype")
            area = box(annotation["/Rect"], width, height)
            if subtype == "/Link":
                action = annotation.get("/A")
                action = action.get_object() if action is not None else None
                if action is not None and action.get("/URI"):
                    spots.append({"type": "uri", "box": area, "href": str(action["/URI"])})
                    continue
                target = destination_page(reader, action.get("/D") if action is not None else annotation.get("/Dest"))
                if target is not None:
                    spots.append({"type": "page", "box": area, "page": target})
            elif subtype == "/Widget":
                name = str(inherited(annotation, "/T"))
                kind = inherited(annotation, "/FT")
                spots.append({"type": "checkbox" if kind == "/Btn" else "text",
                              "box": area, "name": name, "label": field_label(name)})
        pages[index]["spots"] = spots
        total += len(spots)
    manifest.write_text(json.dumps(pages, ensure_ascii=False), encoding="utf-8")
    print(f"{key}: {total} interactive areas")

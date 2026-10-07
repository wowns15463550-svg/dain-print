# 작업 템플릿 PDF + 미리보기 PNG 만들기 (손으로 한 번 돌리면 public/templates/ 에 저장됩니다)
#   python3 scripts/make-templates.py
# Playwright(크로미움)로 HTML을 정확한 mm 크기 PDF로 인쇄합니다.
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent.parent / "public" / "templates"
OUT.mkdir(parents=True, exist_ok=True)

CSS = """
@page { margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
body { font-family: 'Noto Sans CJK KR', 'Pretendard', sans-serif; color: #0D1526 }
.pg { position: relative; overflow: hidden; background: #fff; page-break-after: always }
.bleed { position: absolute; inset: 0; background: repeating-linear-gradient(45deg, #FDECEC 0 1.2mm, #fff 1.2mm 2.4mm) }
.trim { position: absolute; background: #fff; outline: 0.35mm solid #111 }
.safe { position: absolute; border: 0.3mm dashed #1E4BD2 }
.fold { position: absolute; top: 0; bottom: 0; width: 0; border-left: 0.35mm dashed #D6338A }
.lab { position: absolute; font-size: 2.6mm; line-height: 1.35; color: #4A5363 }
.lab b { color: #0D1526 }
.panel { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1.5mm }
.panel .w { font-size: 9mm; font-weight: 700; color: #1E4BD2; letter-spacing: -0.02em }
.panel .n { font-size: 3.4mm; font-weight: 600 }
.panel .s { font-size: 2.4mm; color: #6E7684 }
.legend { position: absolute; font-size: 2.3mm; color: #4A5363; display: flex; gap: 4mm; align-items: center }
.legend i { display: inline-block; width: 6mm; height: 0; vertical-align: middle; margin-right: 1mm }
.title { position: absolute; font-size: 3.2mm; font-weight: 700 }
"""


def legend(x, y, fold=False):
    f = '<span><i style="border-top:0.35mm dashed #D6338A"></i>접는 선</span>' if fold else ""
    return f'''<div class="legend" style="left:{x}mm;top:{y}mm">
<span><i style="border-top:0.35mm solid #111"></i>재단선(완성 크기)</span>
<span><i style="border-top:0.3mm dashed #1E4BD2"></i>안전선(글자는 이 안쪽에)</span>
<span><i style="height:2mm;background:repeating-linear-gradient(45deg,#F5B5B5 0 0.6mm,#fff 0.6mm 1.2mm)"></i>재단 여백(배경을 여기까지)</span>
{f}</div>'''


def page(w, h, inner):
    return f'<div class="pg" style="width:{w}mm;height:{h}mm"><div class="bleed"></div>{inner}</div>'


def trifold():
    B = 3  # 재단 여백
    W, H = 297, 210
    pages = []
    for side, widths, names in [
        ("앞장 (겉면)", [97, 100, 100], [("안쪽으로 접히는 면", "펼치면 처음 보이는 안쪽 면"), ("뒷표지", "접었을 때 뒷면"), ("앞표지", "접었을 때 맨 앞 · 첫 면")]),
        ("뒷장 (안쪽면)", [100, 100, 97], [("안쪽 1", "펼친 안쪽 왼쪽"), ("안쪽 2", "펼친 안쪽 가운데"), ("안쪽 3", "펼친 안쪽 오른쪽")]),
    ]:
        inner = f'<div class="trim" style="left:{B}mm;top:{B}mm;width:{W}mm;height:{H}mm"></div>'
        x = B
        for i, (wd, (n, sub)) in enumerate(zip(widths, names)):
            inner += f'<div class="safe" style="left:{x+5}mm;top:{B+5}mm;width:{wd-10}mm;height:{H-10}mm"></div>'
            inner += f'<div class="panel" style="left:{x}mm;top:{B}mm;width:{wd}mm;height:{H}mm"><span class="w">{wd}mm</span><span class="n">{n}</span><span class="s">{sub}</span></div>'
            x += wd
            if i < 2:
                inner += f'<div class="fold" style="left:{x}mm"></div>'
        inner += f'<div class="title" style="left:{B+5}mm;top:{B+6}mm">A4 3단 리플렛 · {side}</div>'
        inner += f'<div class="lab" style="left:{B+5}mm;top:{B+11}mm">작업 크기 303 × 216mm (완성 297 × 210mm + 사방 3mm)<br>세 칸 폭: <b>{" · ".join(str(v) for v in widths)}mm</b> — 똑같이 나누면 접을 때 걸립니다</div>'
        inner += legend(B + 5, B + H - 9, fold=True)
        pages.append(page(W + 2 * B, H + 2 * B, inner))
    return "a4-trifold", W + 2 * B, H + 2 * B, pages


def card():
    B = 1
    W, H = 90, 50
    inner = f'<div class="trim" style="left:{B}mm;top:{B}mm;width:{W}mm;height:{H}mm"></div>'
    inner += f'<div class="safe" style="left:{B+3}mm;top:{B+3}mm;width:{W-6}mm;height:{H-6}mm"></div>'
    inner += f'<div class="panel" style="left:{B}mm;top:{B}mm;width:{W}mm;height:{H}mm"><span class="w" style="font-size:6mm">90 × 50mm</span><span class="s">작업 크기 92 × 52mm · 사방 1mm 재단 여백<br>글자 · 로고는 파란 점선 안쪽에</span></div>'
    pages = [page(W + 2 * B, H + 2 * B, inner.replace("90 × 50mm", "명함 앞면 · 90 × 50mm")), page(W + 2 * B, H + 2 * B, inner.replace("90 × 50mm", "명함 뒷면 · 90 × 50mm"))]
    return "business-card", W + 2 * B, H + 2 * B, pages


def a4flyer():
    B = 3
    W, H = 210, 297
    pages = []
    for side in ["앞면", "뒷면"]:
        inner = f'<div class="trim" style="left:{B}mm;top:{B}mm;width:{W}mm;height:{H}mm"></div>'
        inner += f'<div class="safe" style="left:{B+5}mm;top:{B+5}mm;width:{W-10}mm;height:{H-10}mm"></div>'
        inner += f'<div class="panel" style="left:{B}mm;top:{B}mm;width:{W}mm;height:{H}mm"><span class="w">A4 전단 · {side}</span><span class="n">완성 210 × 297mm</span><span class="s">작업 크기 216 × 303mm (사방 3mm 재단 여백)<br>단면 전단이면 앞면만 쓰세요</span></div>'
        inner += legend(B + 6, B + H - 10)
        pages.append(page(W + 2 * B, H + 2 * B, inner))
    return "a4-flyer", W + 2 * B, H + 2 * B, pages


with sync_playwright() as p:
    b = p.chromium.launch()
    for name, w, h, pages in [trifold(), card(), a4flyer()]:
        html = f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{''.join(pages)}</body></html>"
        pg = b.new_page()
        pg.set_content(html)
        pg.wait_for_timeout(300)
        pg.pdf(path=str(OUT / f"{name}.pdf"), width=f"{w}mm", height=f"{h}mm", print_background=True, page_ranges="")
        # 미리보기 (첫 장)
        scale = 900 / (w * 96 / 25.4)
        pv = b.new_page(viewport={"width": int(w * 96 / 25.4) + 1, "height": int(h * 96 / 25.4) + 1}, device_scale_factor=scale)
        pv.set_content(f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{pages[0]}</body></html>")
        pv.wait_for_timeout(300)
        pv.locator(".pg").first.screenshot(path=str(OUT / f"{name}.png"))
        print("saved", name)
    b.close()

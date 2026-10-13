// 챗봇 "파일 확인": 손님 기기 안에서만 파일을 열어 간단히 살펴봅니다 (어디로도 보내지 않음).
// 보는 것: 사이즈(A4 등) · 도련 유무 · 가장자리 글씨 · 화질 · 쪽수(중철 가능 여부)
// 모르는 건 모른다고 하고, 정확한 확인은 사장님이 합니다.

export type CheckResult = { ok: boolean; lines: string[]; unsure?: boolean; pages?: number };

const MM = 25.4 / 72; // pt → mm
const SIZES: [string, number, number][] = [
  ["A3", 297, 420],
  ["A4", 210, 297],
  ["A5", 148, 210],
  ["A6", 105, 148],
  ["B3", 364, 515],
  ["B4", 257, 364],
  ["B5", 182, 257],
  ["B6", 128, 182],
  ["A2", 420, 594],
  ["B2", 515, 728],
  ["명함", 90, 50],
];
const TOL = 1.6; // mm 허용 오차
const SAFE = 3; // 재단선 안쪽 3mm 안에 글씨가 있으면 위험
const LOW_DPI = 150;

type SizeHit = { name: string; land: boolean; bleed: number; w: number; h: number };

// 크기(mm)를 표준 규격과 비교. bleed = 사방 도련(mm), 0이면 도련 없음
function matchSize(w: number, h: number): SizeHit | null {
  for (const [name, sw, sh] of SIZES) {
    for (const [W, H, land] of [
      [sw, sh, false],
      [sh, sw, true],
    ] as [number, number, boolean][]) {
      for (const b of [0, 1, 2, 3, 5]) {
        if (Math.abs(w - (W + b * 2)) <= TOL && Math.abs(h - (H + b * 2)) <= TOL) {
          const isCard = name === "명함";
          return { name, land: isCard ? false : land, bleed: b, w: W, h: H };
        }
      }
    }
  }
  return null;
}
const fmt = (n: number) => String(Math.round(n));
const sizeLabel = (s: SizeHit) => `${s.name}${s.land ? " 가로" : ""}`;

let pdfjsP: Promise<any> | null = null;
function loadPdfjs(): Promise<any> {
  if (pdfjsP) return pdfjsP;
  pdfjsP = new Promise((res, rej) => {
    const w = window as any;
    if (w.pdfjsLib) return res(w.pdfjsLib);
    const s = document.createElement("script");
    s.src = "/vendor/pdfjs/pdf.min.js";
    s.onload = () => {
      w.pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.js";
      res(w.pdfjsLib);
    };
    s.onerror = () => {
      pdfjsP = null;
      rej(new Error("load"));
    };
    document.head.appendChild(s);
  });
  return pdfjsP;
}

const mul = (m: number[], n: number[]) => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

// 페이지 안 사진들의 가장 낮은 dpi (아이콘처럼 작은 그림은 뺌)
async function minDpi(page: any, OPS: any): Promise<number | null> {
  const ol = await page.getOperatorList();
  let ctm = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];
  let low: number | null = null;
  for (let i = 0; i < ol.fnArray.length; i++) {
    const fn = ol.fnArray[i];
    const a = ol.argsArray[i];
    if (fn === OPS.save) stack.push(ctm);
    else if (fn === OPS.restore) ctm = stack.pop() || ctm;
    else if (fn === OPS.transform) ctm = mul(ctm, a);
    else if (fn === OPS.paintFormXObjectBegin) {
      stack.push(ctm);
      if (a?.[0]) ctm = mul(ctm, a[0]);
    } else if (fn === OPS.paintFormXObjectEnd) ctm = stack.pop() || ctm;
    else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
      const pw = fn === OPS.paintImageXObject ? a[1] : a[0]?.width;
      const ph = fn === OPS.paintImageXObject ? a[2] : a[0]?.height;
      if (!pw || !ph) continue;
      const wPt = Math.hypot(ctm[0], ctm[1]);
      const hPt = Math.hypot(ctm[2], ctm[3]);
      if (wPt * MM < 20 || hPt * MM < 20) continue; // 2cm보다 작은 그림은 무시
      const dpi = Math.min(pw / (wPt / 72), ph / (hPt / 72));
      if (low === null || dpi < low) low = dpi;
    }
  }
  return low;
}

// 재단선 가까이(안쪽 3mm 이내 또는 바깥) 있는 글씨 수
async function edgeText(page: any, vp: any, bleedMm: number): Promise<number | null> {
  const tc = await page.getTextContent();
  const items = tc.items.filter((t: any) => t.str && t.str.trim());
  if (!items.length) return null;
  const W = vp.width * MM;
  const H = vp.height * MM;
  const lo = bleedMm + SAFE;
  let n = 0;
  for (const t of items) {
    const tr = t.transform;
    const hgt = t.height || Math.hypot(tr[2], tr[3]);
    const p1 = vp.convertToViewportPoint(tr[4], tr[5]);
    const p2 = vp.convertToViewportPoint(tr[4] + t.width * (tr[0] / (Math.hypot(tr[0], tr[1]) || 1)), tr[5] + hgt);
    const x1 = Math.min(p1[0], p2[0]) * MM;
    const x2 = Math.max(p1[0], p2[0]) * MM;
    const y1 = Math.min(p1[1], p2[1]) * MM;
    const y2 = Math.max(p1[1], p2[1]) * MM;
    if (x2 < 0 || y2 < 0 || x1 > W || y1 > H) continue; // 페이지 밖 숨은 글씨
    if (x1 < lo || y1 < lo || x2 > W - lo || y2 > H - lo) n++;
  }
  return n;
}

export async function checkPdf(file: File): Promise<CheckResult> {
  const lib = await loadPdfjs();
  const buf = await file.arrayBuffer();
  let doc: any;
  try {
    doc = await lib.getDocument({ data: buf, isEvalSupported: false }).promise;
  } catch (e: any) {
    if (e?.name === "PasswordException") return { ok: false, unsure: true, lines: ["비밀번호가 걸린 PDF라 열 수 없습니다. 비밀번호를 풀고 다시 올려 주세요."] };
    return { ok: false, unsure: true, lines: ["파일을 열지 못했습니다. 파일이 깨졌을 수 있습니다."] };
  }
  const n = doc.numPages;
  const lines: string[] = [];
  let ok = true;

  const p1 = await doc.getPage(1);
  const vp = p1.getViewport({ scale: 1 });
  const wmm = vp.width * MM;
  const hmm = vp.height * MM;
  const hit = matchSize(wmm, hmm);
  // 펼침면(두 쪽이 한 장)인지: 가로로 두 배 크기
  const half = !hit ? matchSize(wmm / 2, hmm) : null;

  // 쪽마다 크기 다른지
  let mixed = false;
  for (let i = 2; i <= Math.min(n, 60); i++) {
    const v = (await doc.getPage(i)).getViewport({ scale: 1 });
    if (Math.abs(v.width - vp.width) > 4 || Math.abs(v.height - vp.height) > 4) {
      mixed = true;
      break;
    }
  }

  // 1) 사이즈 · 도련
  if (hit) {
    if (hit.bleed > 0) lines.push(`✅ 사이즈: ${sizeLabel(hit)} (${fmt(hit.w)}×${fmt(hit.h)}mm) + 도련 ${hit.bleed}mm`);
    else {
      lines.push(`✅ 사이즈: ${sizeLabel(hit)} (${fmt(hit.w)}×${fmt(hit.h)}mm)`);
      lines.push(`⚠️ 도련(재단 여백)이 없습니다. 가장자리를 얇게 재단(약시)하면 ${hit.name}보다 조금 작아질 수 있습니다.`);
      ok = false;
    }
  } else if (half) {
    lines.push(`⚠️ 두 쪽이 한 장에 붙은 펼침면 파일로 보입니다 (${fmt(wmm)}×${fmt(hmm)}mm). 낱장(한 쪽씩)으로 보내 주세요.`);
    ok = false;
  } else {
    lines.push(`🤔 사이즈: ${fmt(wmm)}×${fmt(hmm)}mm — 자주 쓰는 규격이 아닙니다. 사장님께서 확인해 드립니다.`);
    ok = false;
  }
  if (mixed) {
    lines.push("⚠️ 쪽마다 크기가 다릅니다.");
    ok = false;
  }

  // 2) 가장자리 글씨 · 3) 화질 (앞쪽 최대 10쪽만 빠르게)
  const OPS = lib.OPS;
  let edge = 0;
  let textSeen = false;
  let low: number | null = null;
  const last = Math.min(n, 10);
  for (let i = 1; i <= last; i++) {
    const pg = i === 1 ? p1 : await doc.getPage(i);
    const v = pg.getViewport({ scale: 1 });
    const e = await edgeText(pg, v, hit?.bleed || 0);
    if (e !== null) {
      textSeen = true;
      edge += e;
    }
    try {
      const d = await minDpi(pg, OPS);
      if (d !== null && (low === null || d < low)) low = d;
    } catch {}
  }
  if (!textSeen) lines.push("🤔 글씨 위치는 확인하지 못했습니다. (글씨가 이미지·윤곽선으로 되어 있으면 확인이 어렵습니다)");
  else if (edge > 0) {
    lines.push(`⚠️ 가장자리에 너무 붙은 글씨가 있습니다. 재단 시 잘릴 수 있습니다. 재단선에서 ${SAFE}mm 이상 안쪽으로 옮겨 주세요.`);
    ok = false;
  } else lines.push("✅ 글씨가 가장자리에서 충분히 떨어져 있습니다.");

  if (low === null) lines.push("✅ 화질: 확인할 사진이 없습니다.");
  else if (low < LOW_DPI) {
    lines.push(`⚠️ 화질이 낮은 사진이 있습니다 (약 ${Math.round(low)}dpi). 흐리게 나올 수 있으니 300dpi 원본을 추천드립니다.`);
    ok = false;
  } else lines.push(`✅ 화질 양호합니다 (약 ${Math.round(low)}dpi 이상).`);
  if (n > last) lines.push(`(글씨·화질은 앞 ${last}쪽만 확인했습니다)`);

  // 4) 쪽수 (중철 여부는 손님이 중철이라고 할 때만 따로 알려줌)
  lines.push(`📄 ${n}쪽`);
  doc.destroy?.();
  return { ok, lines, pages: n };
}

export async function checkImage(file: File): Promise<CheckResult> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej();
      img.src = url;
    });
    const pw = img.naturalWidth;
    const ph = img.naturalHeight;
    const long = Math.max(pw, ph);
    const short = Math.min(pw, ph);
    const lines: string[] = [`📐 이미지 크기: ${pw}×${ph}px`];
    let ok = true;
    const ratio = long / short;
    if (Math.abs(ratio - Math.SQRT2) < 0.03) {
      const dpiA4 = Math.min(long / (297 / 25.4), short / (210 / 25.4));
      if (dpiA4 >= LOW_DPI) lines.push(`✅ A4로 뽑으면 약 ${Math.round(dpiA4)}dpi — 화질 양호합니다.`);
      else {
        lines.push(`⚠️ A4로 뽑으면 약 ${Math.round(dpiA4)}dpi — 흐리게 나올 수 있습니다.`);
        ok = false;
      }
    } else {
      const dpiA4 = Math.min(long / (297 / 25.4), short / (210 / 25.4));
      lines.push(`🤔 A4 비율은 아닙니다. 원하시는 인쇄 크기를 알려 주시면 사장님께서 확인해 드립니다.${dpiA4 < LOW_DPI ? " (A4 크기로 키우면 흐리게 나올 수 있습니다)" : ""}`);
      if (dpiA4 < LOW_DPI) ok = false;
    }
    lines.push("🤔 이미지 파일은 도련·글씨 위치를 확인하기 어렵습니다. PDF로 보내 주시면 더 정확합니다.");
    return { ok, lines, unsure: !ok };
  } catch {
    return { ok: false, unsure: true, lines: ["이미지를 열지 못했습니다."] };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function checkFile(file: File): Promise<CheckResult> {
  if (file.size > 150 * 1024 * 1024) return { ok: false, unsure: true, lines: ["파일이 너무 커서(150MB 이상) 여기서는 확인이 어렵습니다. 그대로 보내 주시면 사장님께서 확인해 드립니다."] };
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return checkPdf(file);
  if (/^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/.test(name)) return checkImage(file);
  return { ok: false, unsure: true, lines: ["PDF, JPG, PNG 파일만 확인할 수 있습니다. AI 파일 등은 그대로 보내 주시면 사장님께서 확인해 드립니다."] };
}

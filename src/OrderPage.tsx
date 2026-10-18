// 주문서 도우미 (/order/) — 손님이 사양을 고르면 주문 글이 자동으로 완성됩니다. 가격은 보여주지 않습니다.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Arrow, Ico } from "./App";
import { Shell } from "./ServicePage";
import { CONTACT } from "./site-data";
import { PRODUCTS, SLOW_IDS, SIZE_MM, OTHER, FOLD_OTHER, sizeMM, type Field, type Product, type Vals } from "./order-options";

type Item = { key: number; pid: string; vals: Vals };

const prod = (id: string) => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
const defaults = (p: Product): Vals => settle(p, Object.fromEntries(p.fields.map((f) => [f.k, f.def])));
let seq = 1;
const newItem = (pid = PRODUCTS[0].id): Item => ({ key: seq++, pid, vals: defaults(prod(pid)) });

// 한국 시간 기준 오늘 (YYYY-MM-DD)
const todayKST = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const dayName = (d: string) => "일월화수목금토"[new Date(d + "T12:00:00+09:00").getUTCDay()];

// 사장님이 한눈에 보기 쉽게: 품목마다 "항목 : 값" 줄로 정리
const NUM = "①②③④⑤⑥⑦⑧⑨⑩";
const paperOf = (v: Vals) => {
  const p = String(v.paper ?? "");
  if (p === OTHER) return String(v.paper_txt || "").trim() || "그 외 (요청사항 참고)";
  return p.replace(/^복사용지 \(무림 M COPY 80g\)$/, "복사용지 80g");
};
const coatOf = (v: Vals) => (v.coat === OTHER ? String(v.coat_txt || "").trim() || "그 외 (요청사항 참고)" : String(v.coat));
const sizeOf = (v: Vals, k = "size") => {
  const mm = sizeMM(v[k]);
  return mm ? `${v[k]} (${mm})` : String(v[k] ?? "");
};
const join = (...xs: unknown[]) => xs.filter((x) => x && x !== "없음").map((x) => (x === "단면" ? "★단면" : x)).join(" · ");
// 세네카(책등 두께): 모조 100g만, 100쪽(양면 50장) ≈ 5.9mm 기준
export const spineMM = (v: Vals) => {
  if (v.paper !== "모조 100g") return null;
  const pages = Number(v.pages) || 0;
  const sheets = v.side === "단면" ? pages : Math.ceil(pages / 2);
  return sheets ? Math.round(sheets * 0.118 * 10) / 10 : null;
};

function describe(it: Item) {
  const p = prod(it.pid);
  const v = it.vals;
  const r: [string, string][] = [];
  const size = sizeOf(v);
  switch (p.id) {
    case "perfect":
      r.push(["크기", size]);
      if (v.orient === "가로형") r.push(["방향", `가로형 · ${String(v.bind).replace(/ \(.*\)$/, "")}`]);
      r.push(["내지", join(paperOf(v), v.side, v.color)], ["표지", "스노우지 250g · 단면 · 무광코팅"], ["페이지", `${v.pages}p`]);
      if (spineMM(v)) r.push(["세네카", `약 ${spineMM(v)}mm`]);
      r.push(["권수", `${v.qty}권`]);
      break;
    case "spring":
      r.push(["크기", size]);
      if (v.orient === "가로형") r.push(["방향", "가로형"]);
      r.push(["내지", join(paperOf(v), v.side, v.color)], ["페이지", `${v.pages}p (표지 포함)`], ["권수", `${v.qty}권`]);
      break;
    case "saddle":
      r.push(["크기", size]);
      if (v.orient === "가로형") r.push(["방향", `가로형 · ${String(v.bind).replace(/ \(.*\)$/, "")}`]);
      r.push(["용지", paperOf(v)], ["표지", v.coat === "없음" ? "코팅 없음" : coatOf(v)], ["페이지", `${v.pages}p (표지 포함)`], ["권수", `${v.qty}권`]);
      break;
    case "flyer":
      r.push(["크기", size], ["용지", join(paperOf(v), v.side)], ["수량", `${v.qty}장`]);
      break;
    case "sheet":
      r.push(["크기", size], ["용지", join(paperOf(v), v.side)]);
      if (v.coat !== "없음") r.push(["코팅", coatOf(v)]);
      if (v.fold !== "없음") r.push(["접지", v.fold === FOLD_OTHER ? String(v.fold_txt || "").trim() || "그 외 (요청사항 참고)" : String(v.fold)]);
      r.push(["수량", `${v.qty}장`]);
      break;
    case "card":
      r.push(["크기", "90×50mm"], ["용지", paperOf(v)], ["수량", `${v.kinds}종 × ${v.qty}장`]);
      break;
    case "poster":
      r.push(["크기", size], ["용지", `${v.paper} ${v.weight}`]);
      if (v.coat !== "없음") r.push(["코팅", coatOf(v)]);
      r.push(["수량", `${v.kinds}종 × ${v.qty}장`]);
      break;
    case "form":
      r.push(["크기", size], ["용지", join(paperOf(v), v.side, v.color)], ["페이지", `${v.pages}p (한 부당)`], ["부수", `${v.qty}부`]);
      if (v.staple) r.push(["스테이플", "왼쪽 위"]);
      break;
    default:
      r.push(["수량", `${v.qty}개`]);
  }
  return { name: p.name.replace(/ \(.*\)$/, ""), rows: r };
}

// 따로 봐야 할 것 (특이사항으로 맨 위에 강조)
function flags(it: Item): string[] {
  const v = it.vals;
  const f: string[] = [];
  if (v.paper === OTHER) f.push(`종이 직접 지정: ${paperOf(v)}`);
  if (v.fold === FOLD_OTHER) f.push(`접지 직접 지정: ${String(v.fold_txt || "").trim() || "요청사항 확인"}`);
  if (v.coat === OTHER) f.push(`코팅 직접 지정: ${coatOf(v)}`);
  if (it.pid === "saddle" && Number(v.pages) % 4 !== 0) f.push(`중철 쪽수 ${v.pages}p — 4의 배수 아님`);
  if (v.orient === "가로형") f.push(v.bind ? `가로형 ${String(v.bind).replace(/ \(.*\)$/, "")}` : "가로형");
  return f;
}

// 고른 값에 따라 선택지 · 막힘 상태 정리 (포스터 평량, 코팅 조건)
export function settle(p: Product, v: Vals): Vals {
  const o = { ...v };
  for (const f of p.fields) {
    if (f.type !== "pick") continue;
    if (f.optsOf) {
      const opts = f.optsOf(o);
      if (!opts.includes(String(o[f.k]))) o[f.k] = opts[0];
    }
    if (f.offOf && f.offOf(o).includes(String(o[f.k]))) o[f.k] = f.def;
  }
  // 쪽수 최대 (스프링: 단면이면 50쪽)
  for (const f of p.fields) {
    if (f.type === "num" && f.maxOf && Number(o[f.k]) > f.maxOf(o)) o[f.k] = f.maxOf(o);
  }
  for (const f of p.fields) {
    if (f.type === "pick" && f.block && f.block(o) && o[f.k] !== "없음") o[f.k] = "없음";
  }
  return o;
}

// 그림 카드 (모든 선택 항목). 파란 면 = 앞면, 회색 = 안쪽 / 책등
const W = { className: "w" }; // 흰 면
const Bl = { className: "b" }; // 파란 면
const G = { className: "g" }; // 안쪽(회색) 면
const Ln = (y: number, x1 = 0, x2 = 0) => <path key={y + "-" + x1} className="ln" d={`M${x1} ${y}h${x2 - x1}`} />;
const lines = (x1: number, x2: number, ys: number[]) => ys.map((y) => Ln(y, x1, x2));

const PICS: Record<string, ReactNode> = {
  // ── 방향 · 넘기는 방향
  가로형: (<><path {...W} d="M6 14h46l6 6v24H6z" /><path {...Bl} d="M10 18h22v22H10z" />{lines(36, 52, [24, 30, 36])}</>),
  세로형: (<><path {...W} d="M16 5h26l6 6v40H16z" /><path {...Bl} d="M20 10h22v16H20z" />{lines(21, 43, [33, 39, 45])}</>),
  "좌철 (옆으로 넘김)": (<><path {...W} d="M8 12h46v32H8z" /><path {...G} d="M8 12h8v32H8z" />{[17, 24, 31, 38].map((y) => <circle key={y} cx="12" cy={y} r="1.6" fill="#6B7280" />)}{lines(22, 48, [22, 28, 34])}<path className="ar" d="M44 48h10m-4-3l4 3-4 3" /></>),
  "상철 (위로 넘김)": (<><path {...W} d="M8 14h46v36H8z" /><path {...G} d="M8 14h46v8H8z" />{[14, 22, 30, 38, 46].map((x) => <circle key={x} cx={x + 2} cy="18" r="1.6" fill="#6B7280" />)}{lines(14, 48, [30, 36, 42])}<path className="ar" d="M58 38v-10m-3 4l3-4 3 4" /></>),
  // ── 접지
  없음: (<path {...W} d="M18 6h28v44H18z" />),
  반접지: (<><path {...Bl} d="M8 12h24v32H8z" /><path {...W} d="M32 12h24v32H32z" /><path className="ar" d="M14 50h16m-4-3l4 3-4 3" /></>),
  "3단 접지": (<><path {...Bl} d="M8 12h16v32H8z" /><path {...W} d="M24 12h16v32H24z" /><path {...G} d="M40 12h16v32H40z" /><path className="ar" d="M12 50h10m-3-3l3 3-3 3M52 50H42m3-3l-3 3 3 3" /></>),
  "대문 접지": (<><path {...Bl} d="M8 12h12v32H8z" /><path {...W} d="M20 12h24v32H20z" /><path {...Bl} d="M44 12h12v32H44z" /><path className="ar" d="M10 50h9m-3-3l3 3-3 3M54 50h-9m3-3l-3 3 3 3" /></>),
  // ── 인쇄 · 면
  흑백: (<circle cx="32" cy="28" r="12" fill="#222" />),
  칼라: (<><path d="M32 28L32 16A12 12 0 0 1 42.4 34Z" style={{ fill: "#E8635A" }} /><path d="M32 28L42.4 34A12 12 0 0 1 21.6 34Z" style={{ fill: "#4C8DF0" }} /><path d="M32 28L21.6 34A12 12 0 0 1 32 16Z" style={{ fill: "#F2C94C" }} /></>),
  단면: (<><path {...W} d="M16 5h26l6 6v40H16z" /><text x="32" y="34" textAnchor="middle">1면</text></>),
  양면: (<><path {...W} d="M10 8h24l5 5v36H10z" /><path {...W} d="M24 5h24l5 5v36H24z" /><text x="38" y="30" textAnchor="middle">앞·뒤</text></>),
  // ── 코팅
  없음_코팅: (<path {...W} d="M18 6h28v44H18z" />),
  무광코팅: (<><path {...W} d="M16 5h32v46H16z" /><path className="sh" d="M16 30L38 5h10L16 40z" /><path className="sh" d="M26 51l22-26v14L36 51z" /></>),
  그외: (<><path {...W} d="M16 5h32v46H16z" /><text x="32" y="34" textAnchor="middle">···</text></>),
  // ── 용지 (결 · 질감은 색으로 구분)
  종이: (<><path {...W} d="M12 22l20-8 22 8-22 9z" /><path {...W} d="M12 28l20 9 22-9v6l-22 9-20-9z" /></>),
  // ── 품목
  "p:perfect": (<><path {...W} d="M14 5h34v46H14z" /><path {...W} d="M14 5h6v46h-6z" /><path {...W} d="M26 13h16v14H26z" />{lines(29, 39, [17, 20.5, 24])}{lines(26, 42, [36, 41])}</>),
  "p:spring": (<><path {...W} d="M16 6h36v44H16z" />{[11, 18, 25, 32, 39, 46].map((y) => <path key={y} className="ln" d={`M11 ${y}h10`} />)}{[11, 18, 25, 32, 39, 46].map((y) => <circle key={y} cx="16" cy={y} r="1.8" fill="#6B7280" />)}<path {...Bl} d="M24 11h22v14H24z" />{lines(24, 46, [32, 38, 44])}</>),
  "p:saddle": (<><path {...W} d="M6 14l26 5v31l-26-5z" /><path {...Bl} d="M32 19l26-5v31l-26 5z" /><path className="ln" d="M32 19v31" /><circle cx="32" cy="26" r="1.6" fill="#C2544A" /><circle cx="32" cy="42" r="1.6" fill="#C2544A" />{lines(11, 27, [27, 32, 37])}</>),
  "p:flyer": (<><path {...W} d="M14 5h30l6 6v40H14z" /><path {...Bl} d="M19 11h26v16H19z" />{lines(19, 45, [34, 39, 44])}</>),
  "p:sheet": (<><path {...Bl} d="M6 14l17-4v34l-17 4z" /><path {...W} d="M23 10l18 4v34l-18-4z" /><path {...G} d="M41 14l17-4v34l-17 4z" />{lines(27, 37, [22, 28, 34])}</>),
  "p:card": (<><path {...W} d="M6 14h50v30H6z" /><path {...Bl} d="M11 20h12v12H11z" />{lines(29, 51, [24, 30, 36])}</>),
  "p:poster": (<><path {...W} d="M14 3h28v50H14z" /><path {...Bl} d="M18 8h20v26H18z" /><text x="28" y="25" textAnchor="middle">POSTER</text>{lines(18, 38, [41, 46])}</>),
  "p:form": (<><path {...G} d="M16 8h32v42H16z" /><path {...W} d="M12 5h32v42H12z" />{lines(17, 39, [15, 21, 27, 33])}<path className="st" d="M13 10l5 4" /></>),
  // ── 받는 방법
  "방문 픽업": (<><path {...W} d="M10 22h44v28H10z" /><path {...Bl} d="M8 12h48l-4 10H12z" /><path {...G} d="M26 32h12v18H26z" /></>),
  "택배 (CJ대한통운)": (<><path {...W} d="M10 18l22-8 22 8v26l-22 8-22-8z" /><path className="ln" d="M10 18l22 8 22-8M32 26v26" /><path {...Bl} d="M20 14l22 8-6 3-22-8z" /></>),
  "퀵 (서울 근교)": (<><path {...W} d="M4 14h14v12H4z" /><circle cx="14" cy="42" r="8" {...W} /><circle cx="50" cy="42" r="8" {...W} /><path {...Bl} d="M18 34h18l4-8H22z" /><path className="ln" d="M22 26l-4 8M40 26l10 16M44 20h8" /><path {...G} d="M36 34l6-14h6" /></>),
};
// 종이 · 품목 이름 → 그림
const paperPic = (o: string): ReactNode => {
  const fill = o.startsWith("모조") || o.startsWith("백색") ? "#F6EFD9" : o.startsWith("랑데뷰") ? "#E7E4F2" : o.startsWith("반누보") ? "#EADFCB" : o.startsWith("복사") ? "#FFFFFF" : "#FFFFFF";
  return (
    <>
      <path d="M10 34l22 9 22-9v6l-22 9-22-9z" style={{ fill }} />
      <path d="M10 27l22 9 22-9v6l-22 9-22-9z" style={{ fill }} />
      <path d="M10 20l22-9 22 9-22 9z" style={{ fill }} />
    </>
  );
};
// 크기 그림 — 실제 비율대로 그린 종이
const sizePic = (o: string, all: string[]): ReactNode => {
  const m = SIZE_MM[o];
  if (!m) return <path {...W} d="M14 6h36v44H14z" />;
  // 같은 줄에 있는 크기끼리 실제 비율로 비교되게 같은 축척으로 그림
  const mw = Math.max(...all.map((x) => SIZE_MM[x]?.[0] ?? 0));
  const mh = Math.max(...all.map((x) => SIZE_MM[x]?.[1] ?? 0));
  const k = Math.min(48 / mw, 52 / mh);
  const w = m[0] * k, h = m[1] * k;
  return <path {...W} d={`M${32 - w / 2} ${54 - h}h${w}v${h}h${-w}z`} />;
};
const PIC_LABEL: Record<string, string> = {
  가로형: "가로", 세로형: "세로", 없음: "없음", "명함 (90×50)": "명함(90×50)",
  "좌철 (옆으로 넘김)": "좌철 (옆으로)", "상철 (위로 넘김)": "상철 (위로)",
  "택배 (CJ대한통운)": "택배", "퀵 (서울 근교)": "퀵", "복사용지 (무림 M COPY 80g)": "복사용지 80g",
};
const PROD_LABEL: Record<string, string> = { perfect: "무선제본", spring: "스프링", saddle: "중철", flyer: "전단지", sheet: "낱장 인쇄", card: "명함", poster: "포스터", form: "양식·스테이플" };
const PROD_SUB: Record<string, string> = { perfect: "(떡제본)", sheet: "(리플렛 · 엽서)" };
// 그림 카드로 보여줄 항목 (용지 · 크기 · 코팅 …)
const RECV_IMG: Record<string, string> = { "방문 픽업": "/assets/recv-pickup.webp", "택배 (CJ대한통운)": "/assets/recv-parcel.webp", "퀵 (서울 근교)": "/assets/recv-quick.webp" };
const PIC_KEYS = ["size", "csize", "orient", "bind", "color", "paper", "coat", "fold"];

type PicItem = { key: string; label: string; sub?: string; art?: ReactNode; img?: string; off?: boolean };
function PicRow({ items, value, label, onPick, big }: { items: PicItem[]; value: string; label: string; onPick: (k: string) => void; big?: boolean }) {
  return (
    <div className={big ? "od-pics big" : "od-pics"} role="radiogroup" aria-label={label}>
      {items.map((it) => (
        <button type="button" key={it.key} role="radio" aria-checked={value === it.key} disabled={it.off} className={(value === it.key ? "on" : "") + (it.off ? " x" : "") || undefined} onClick={() => onPick(it.key)}>
          {it.img ? (
            <img src={it.img} alt="" width={140} height={140} loading="lazy" />
          ) : (
            <svg viewBox="0 0 64 56" aria-hidden="true">
              {it.art}
              {it.off && <path className="od-x" d="M14 8l36 40M50 8L14 48" />}
            </svg>
          )}
          <span>{it.label}</span>
          {it.sub && <small>{it.sub}</small>}
        </button>
      ))}
    </div>
  );
}

const artOf = (k: string, o: string, all: string[] = []): ReactNode => {
  if (k === "size") return sizePic(o, all);
  if (k === "paper") return paperPic(o);
  if (k === "coat") return PICS[o === "없음" ? "없음_코팅" : o === OTHER ? "그외" : o] ?? PICS["없음_코팅"];
  if (o.startsWith(OTHER)) return PICS["그외"];
  return PICS[o] ?? PICS["없음"];
};

function Ctl({ f, v, set }: { f: Field; v: Vals; set: (k: string, x: string | number | boolean) => void }) {
  if (f.type === "pick") {
    if (f.showIf && !f.showIf(v)) return null;
    const opts = f.optsOf ? f.optsOf(v) : f.opts;
    const why = f.block ? f.block(v) : null;
    const asPic = f.pic || PIC_KEYS.includes(f.k);
    const off = [...(f.offOf?.(v) ?? []), ...(why ? opts.filter((o) => o !== "없음") : [])];
    const hint = why ?? f.hintOf?.(v) ?? f.hint;
    const tone = (o: string) => (f.k === "color" ? (o === "흑백" ? " bk" : o === "칼라" ? " red" : "") : "");
    const mm = (f.k === "size" || f.k === "csize") && SIZE_MM[String(v[f.k])] ? `${v[f.k]} = ${sizeMM(v[f.k])}mm` : "";
    return (
      <div className="od-field">
        <span className="od-lab">{f.label}</span>
        {asPic ? (
          <PicRow
            label={f.label}
            value={String(v[f.k])}
            onPick={(o) => set(f.k, o)}
            items={opts.map((o) => ({ key: o, label: f.k === "fold" && o === "없음" ? "접지 안 함" : (PIC_LABEL[o] ?? o), sub: f.k === "size" ? sizeMM(o) : undefined, art: artOf(f.k, o, opts), off: off.includes(o) }))}
          />
        ) : (
          <div className="od-chips" role="radiogroup" aria-label={f.label}>
            {opts.map((o) => (
              <button type="button" key={o} role="radio" aria-checked={v[f.k] === o} disabled={off.includes(o)} className={(v[f.k] === o ? "on" : "") + tone(o) || undefined} onClick={() => set(f.k, o)}>
                {o}
              </button>
            ))}
          </div>
        )}
        {mm && <small className="od-size">{mm}</small>}
        {f.custom && v[f.k] === f.custom && (
          <input className="od-in" value={String(v[f.k + "_txt"] ?? "")} onChange={(e) => set(f.k + "_txt", e.target.value)} placeholder={f.k === "coat" ? "원하시는 코팅을 적어 주세요" : f.k === "fold" ? "원하시는 접지를 적어 주세요" : "원하시는 종이를 적어 주세요 (예: 랑데뷰 130g)"} />
        )}
        {hint && <small className={why || off.length ? "od-warn" : "od-hint"}>{hint}</small>}
      </div>
    );
  }
  if (f.type === "num") {
    const n = Number(v[f.k]) || 0;
    const fix = (x: number) => {
      let y = Math.max(f.min, Math.round(x));
      if (f.maxOf) y = Math.min(f.maxOf(v), y);
      if (f.mult4) y = Math.max(8, Math.round(y / 4) * 4);
      else if (f.step > 1) y = Math.max(f.min, Math.round(y / f.step) * f.step);
      return y;
    };
    return (
      <div className="od-field">
        <label className="od-lab" htmlFor={`n-${f.k}`}>
          {f.label}
        </label>
        <div className="od-num">
          <button type="button" aria-label="줄이기" onClick={() => set(f.k, fix(n - f.step))}>
            −
          </button>
          <input id={`n-${f.k}`} inputMode="numeric" value={n || ""} onChange={(e) => set(f.k, Number(e.target.value.replace(/\D/g, "")) || 0)} onBlur={() => set(f.k, fix(n))} />
          <span>{f.unit}</span>
          <button type="button" aria-label="늘리기" onClick={() => set(f.k, fix(n + f.step))}>
            +
          </button>
        </div>
        {f.mult4 && n % 4 !== 0 && <small className="od-warn">중철은 4의 배수만 가능해요 (8 · 12 · 16 …)</small>}
        {f.minWhy && n > 0 && n < f.min && <small className="od-warn">{f.minWhy}</small>}
        {f.maxOf && n > f.maxOf(v) && <small className="od-warn">최대 {f.maxOf(v)}{f.unit}까지 가능해요.</small>}
        {f.hint && <small className="od-hint">{f.hint}</small>}
        {f.k === "pages" && "bind" in v && spineMM(v) && <small className="od-spine">세네카(책등) 약 {spineMM(v)}mm · 표지 만들 때 참고</small>}
      </div>
    );
  }
  return (
    <div className="od-field">
      <span className="od-lab">{f.label}</span>
      <label className="od-check">
        <input type="checkbox" checked={!!v[f.k]} onChange={(e) => set(f.k, e.target.checked)} />
        <span>{f.text}</span>
      </label>
    </div>
  );
}

export function OrderRoot() {
  return (
    <Shell>
      <OrderView />
    </Shell>
  );
}

export default function OrderView() {
  const [items, setItems] = useState<Item[]>([newItem()]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [due, setDue] = useState("");
  const [sameDay, setSameDay] = useState(false);
  const [dueTime, setDueTime] = useState("상관없음");
  const [recv, setRecv] = useState("방문 픽업");
  const [addr, setAddr] = useState("");
  const [memo, setMemo] = useState("");
  const [copied, setCopied] = useState("");
  const [today, setToday] = useState("");

  // 품목 페이지에서 ?item=spring-binding 처럼 들어오면 그 품목으로 시작
  useEffect(() => {
    setToday(todayKST());
    const q = new URLSearchParams(location.search).get("item");
    const p = PRODUCTS.find((x) => x.slug === q || x.id === q);
    if (p) setItems([newItem(p.id)]);
  }, []);

  const upd = (key: number, fn: (it: Item) => Item) => setItems((xs) => xs.map((x) => (x.key === key ? fn(x) : x)));

  const warns: string[] = [];
  const dueD = sameDay ? today : due;
  if (dueD && today) {
    const due = dueD;
    const wd = new Date(due + "T12:00:00+09:00").getUTCDay();
    if (due < today) warns.push("지난 날짜를 고르셨어요.");
    if (wd === 0 || wd === 6) warns.push("주말은 쉽니다. 주말 작업이 꼭 필요하면 미리 상의해 주세요 (협의 시 주말 출근 수당).");
    if (due === today) {
      const slow = items.some((it) => SLOW_IDS.includes(it.pid) || (it.pid === "sheet" && it.vals.fold !== "없음"));
      warns.push(
        slow
          ? "중철 · 명함 · 접지 작업은 당일 출고가 어려울 수 있어요. 먼저 전화나 카톡으로 가능 여부를 확인해 주세요."
          : "오전에 주문하시고 파일에 문제가 없으면 보통 오후 5시쯤 나옵니다. 오후 주문은 먼저 연락 주세요.",
      );
    }
  }

  const text = useMemo(() => {
    const L: string[] = [];
    const dd = sameDay ? today : due;
    const when = dd ? `${dd.slice(5).replace("-", ".")}(${dayName(dd)})${dueTime === "상관없음" ? "" : " " + dueTime}` : "급하지 않음";
    L.push(`[주문] ${name || "성함"} · ${phone || "연락처"}`);
    L.push(`${sameDay ? "★당일★ " : ""}${when} · ${recv.replace(/ \(.*\)$/, "")}`);
    if (recv !== "방문 픽업" && addr.trim()) L.push(`주소: ${addr.trim()}`);
    const special: string[] = [];
    if (sameDay) special.push("당일 필요 (오늘 받아야 함)");
    if (dd) {
      const wd = new Date(dd + "T12:00:00+09:00").getUTCDay();
      if (wd === 0 || wd === 6) special.push("주말 날짜");
    }
    items.forEach((it, i) => flags(it).forEach((x) => special.push(items.length > 1 ? `${NUM[i] ?? i + 1} ${x}` : x)));
    if (memo.trim()) special.push(`요청: ${memo.trim()}`);
    if (special.length) {
      L.push("", "⚠️ 특이사항");
      special.forEach((x) => L.push(`· ${x}`));
    }
    items.forEach((it, i) => {
      const d = describe(it);
      L.push("", "━━━━━━━━━━", `${items.length > 1 ? (NUM[i] ?? i + 1) + " " : ""}${d.name}`);
      d.rows.forEach(([k, v]) => L.push(`${k} : ${v}`));
    });
    return L.join("\n");
  }, [items, name, phone, due, sameDay, today, dueTime, recv, addr, memo]);

  const copy = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(tag);
    window.setTimeout(() => setCopied(""), 2500);
  };
  const missing = !name.trim() || !phone.trim();

  return (
    <>
      <section className="sp-hero od-hero">
        <div className="wrap od-hero-grid">
          <div className="sp-hero-copy">
            <nav className="sp-crumb" aria-label="현재 위치">
              <a href="/">다인인쇄소</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">간단하게 주문하기</span>
            </nav>
            <h1 className="serif">
              간단하게 주문하기,
              <br />
              <strong>눌러서 고르면 끝</strong>
            </h1>
            <p className="sp-lead">원하는 사양을 고르면 주문 내용이 자동으로 정리됩니다. 카톡이나 네이버 메일로 보내주시면 파일을 확인하고 견적과 일정을 알려드려요.</p>
            <ol className="od-steps">
              <li>
                <b>1</b>
                <span>
                  품목 · 사양 <em>고르기</em>
                </span>
              </li>
              <li>
                <b>2</b>
                <span>
                  날짜 · 받는 방법 <em>적기</em>
                </span>
              </li>
              <li>
                <b>3</b>
                <span>
                  카톡 · 메일로 <em>보내기</em>
                </span>
              </li>
            </ol>
          </div>
          <div className="od-hero-img">
            <img src="/assets/order-hero2.webp" alt="휴대폰으로 인쇄 주문서를 고르고 보내는 모습" width={1168} height={880} />
          </div>
        </div>
      </section>

      <section className="sp-sec od">
        <div className="wrap od-grid">
          <div className="od-form">
            {items.map((it, idx) => {
              const p = prod(it.pid);
              return (
                <div className="od-card" key={it.key}>
                  <div className="od-card-h">
                    <h2>품목 {items.length > 1 ? idx + 1 : ""}</h2>
                    {items.length > 1 && (
                      <button type="button" className="od-del" onClick={() => setItems((xs) => xs.filter((x) => x.key !== it.key))}>
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="od-field">
                    <span className="od-lab">무엇을 만드세요?</span>
                    <PicRow
                      label="품목"
                      value={it.pid}
                      onPick={(id) => upd(it.key, () => ({ key: it.key, pid: id, vals: defaults(prod(id)) }))}
                      items={PRODUCTS.map((pp) => ({ key: pp.id, label: PROD_LABEL[pp.id] ?? pp.name, sub: PROD_SUB[pp.id], art: PICS["p:" + pp.id] }))}
                    />
                  </div>
                  {p.note && <p className="od-note">{p.note}</p>}
                  {p.fields.map((f) => (
                    <Ctl key={f.k} f={f} v={it.vals} set={(k, x) => upd(it.key, (o) => ({ ...o, vals: settle(p, { ...o.vals, [k]: x }) }))} />
                  ))}
                  {p.slug && (
                    <a className="od-more" href={`/${p.slug}/`} target="_blank" rel="noreferrer">
                      이 품목 안내 보기 <Arrow />
                    </a>
                  )}
                </div>
              );
            })}
            <button type="button" className="od-add" onClick={() => setItems((xs) => [...xs, newItem()])}>
              + 품목 추가
            </button>

            <div className="od-card">
              <div className="od-card-h">
                <h2>받는 분 · 일정</h2>
              </div>
              <div className="od-row">
                <label className="od-field">
                  <span className="od-lab">성함 · 회사명 *</span>
                  <input className="od-in" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동 / ○○학원" />
                </label>
                <label className="od-field">
                  <span className="od-lab">연락처 *</span>
                  <input className="od-in" value={phone} inputMode="tel" onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" />
                </label>
              </div>
              <div className="od-row">
                <label className="od-field">
                  <span className="od-lab">언제까지 필요하세요?</span>
                  <button type="button" className={sameDay ? "od-today on" : "od-today"} aria-pressed={sameDay} onClick={() => setSameDay((x) => !x)}>
                    <i aria-hidden="true">{sameDay ? "✓" : ""}</i> 당일 (오늘 필요해요)
                  </button>
                  <input className="od-in" type="date" value={sameDay ? today : due} min={today || undefined} disabled={sameDay} onChange={(e) => setDue(e.target.value)} />
                  {!sameDay && <small className="od-hint">비워 두면 "급하지 않음"으로 보냅니다.</small>}
                </label>
                <div className="od-field">
                  <span className="od-lab">시간</span>
                  <div className="od-chips">
                    {["상관없음", "오전까지", "오후 5시쯤", "퇴근 전(7시)"].map((o) => (
                      <button type="button" key={o} className={dueTime === o ? "on" : undefined} onClick={() => setDueTime(o)}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {warns.map((w) => (
                <p className="od-warn od-warn-box" key={w}>
                  {w}
                </p>
              ))}
              <div className="od-field">
                <span className="od-lab">받는 방법</span>
                <PicRow big label="받는 방법" value={recv} onPick={setRecv} items={["방문 픽업", "택배 (CJ대한통운)", "퀵 (서울 근교)"].map((o) => ({ key: o, label: PIC_LABEL[o] ?? o, img: RECV_IMG[o] }))} />
                {recv !== "방문 픽업" ? (
                  <input className="od-in" value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="받으실 주소 · 받는 분 · 연락처" />
                ) : (
                  <small className="od-hint">충무로역 7번 출구 도보 3분. 주차장은 없고 매장 앞에 잠깐 정차 가능합니다.</small>
                )}
                {recv.startsWith("택배") && <small className="od-hint">발송 후 1~2일 걸리고 하루 더 걸릴 수 있어요. 날짜가 정해진 급한 인쇄물은 퀵을 권합니다.</small>}
              </div>
              <label className="od-field">
                <span className="od-lab">요청사항</span>
                <textarea className="od-in" rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="" />
              </label>
            </div>
          </div>

          <aside className="od-out" aria-label="완성된 주문 내용">
            <div className="od-out-in">
              <h2>주문 내용</h2>
              <pre>{text}</pre>
              {missing && <p className="od-warn">성함과 연락처를 적어 주세요.</p>}
              <div className="od-send">
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => {
                    copy("kakao");
                    window.open(CONTACT.kakao, "_blank", "noopener");
                  }}
                >
                  <Ico k="talk" /> {copied === "kakao" ? "복사됨 · 채팅창에 붙여넣기" : "카톡으로 보내기"}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    copy("mail");
                    window.open(CONTACT.mailWrite, "_blank", "noopener");
                  }}
                >
                  <Ico k="mail" /> {copied === "mail" ? "복사됨 · 메일 본문에 붙여넣기" : "네이버 메일로 보내기"}
                </button>
                <button type="button" className="btn od-copy" onClick={() => copy("copy")}>
                  {copied === "copy" ? "복사됐어요" : "내용만 복사"}
                </button>
              </div>
              <ul className="od-tips">
                <li>
                  <b>카톡</b>은 내용이 복사된 채로 상담창이 열려요. 채팅창에 붙여넣기만 하면 됩니다.
                </li>
                <li>
                  <b>네이버 메일</b>은 받는 사람({CONTACT.email})이 채워진 메일 쓰기 창이 열려요. 복사된 내용을 본문에 붙여넣고 파일을 첨부해서 보내 주세요.
                </li>
                <li>가격은 파일을 확인한 뒤 견적으로 알려드립니다.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
